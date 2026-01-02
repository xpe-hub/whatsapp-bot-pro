/**
 * XPE Bot - Entry Point Principal
 * Inicializa todos los sistemas del bot
 */

import { createRequire } from 'module';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { useMultiFileAuthState, Browsers } from '@whiskeysockets/baileys';
import makeWASocket from '@whiskeysockets/baileys';

import CONFIG, { validateConfig, getOwnerNumber, getJid } from '../config/settings.js';
import BRANDING from '../config/branding.js';
import logger from '../lib/logger.js';
import { messageHandler } from './handler.js';
import { loadPlugins } from './loader.js';
import { startPanelServer } from '../services/panel-server.js';

// ============================================
// Constantes
// ============================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(__filename);

// Sesión auth
const AUTH_FOLDER = CONFIG.sessionsDir;

// ============================================
// Funciones Auxiliares de Auth
// ============================================

function getMessageKey(message) {
    if (message.conversation) return message.conversation;
    if (message.extendedTextMessage) return message.extendedTextMessage.text;
    return JSON.stringify(message);
}

// ============================================
// Clase Principal del Bot
// ============================================
class XPEBot {
    constructor() {
        this.sock = null;
        this.isConnected = false;
        this.isRestarting = false;
        this.reconnectAttempts = 0;
        this.panelServer = null;
    }

    /**
     * Inicializar el bot
     */
    async start() {
        console.log(`
╔══════════════════════════════════════════╗
║         XPE Bot - Starting...            ║
║     ${BRANDING.botName} v${BRANDING.version}                ║
╚══════════════════════════════════════════╝
        `);

        // Validar configuración
        const validation = validateConfig();
        if (!validation.valid) {
            validation.errors.forEach(e => logger.warn(e));
            logger.warn('El bot iniciará con configuración limitada');
        }

        // Cargar plugins
        logger.bot('Cargando plugins...');
        await loadPlugins();
        logger.bot('Plugins cargados correctamente');

        // Iniciar servidor del panel
        this.initPanelServer();

        // Conectar a WhatsApp
        await this.connectToWhatsApp();
    }

    /**
     * Inicializar servidor del panel
     */
    initPanelServer() {
        try {
            this.panelServer = startPanelServer(this);
            logger.panel(`Panel iniciado en puerto ${CONFIG.panelPort}`);
        } catch (error) {
            logger.panel(`Error iniciando panel: ${error.message}`);
        }
    }

    /**
     * Conectar a WhatsApp
     */
    async connectToWhatsApp() {
        logger.bot('Iniciando conexión con WhatsApp...');

        // Verificar carpeta de sesiones
        if (!existsSync(AUTH_FOLDER)) {
            logger.auth('Nueva sesión detected. Se generará QR.');
        }

        try {
            // Estado de autenticación
            const { state, saveCreds } = await useMultiFileAuthState(
                AUTH_FOLDER,
                createHash('md5').update(CONFIG.ownerNumber).digest('hex')
            );

            // Crear socket
            this.sock = makeWASocket({
                auth: state,
                printQRInTerminal: true,
                browser: Browsers.appropriate('XPE Bot'),
                syncFullHistory: false
            });

            // Eventos del socket
            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                // Mostrar QR si existe
                if (qr) {
                    console.log(`
╔══════════════════════════════════════════╗
║     📱 ESCANEA ESTE CÓDIGO QR            ║
╚══════════════════════════════════════════╝
                    `);
                    logger.auth('Código QR generado. Escanéalo con WhatsApp.');
                }

                // Estado de conexión
                if (connection === 'open') {
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    logger.bot('✅ Conectado a WhatsApp exitosamente!');

                    // Notificar al panel
                    if (this.panelServer) {
                        this.panelServer.setBotStatus(true, null);
                    }

                    // Notificar al owner si está configurado
                    if (CONFIG.notifyOnStart) {
                        this.notifyOwner(BRANDING.getBotStartedMessage(
                            `http://localhost:${CONFIG.panelPort}`,
                            CONFIG.commandPrefix
                        ));
                    }
                }

                if (connection === 'close') {
                    this.isConnected = false;
                    const code = lastDisconnect?.error?.output?.statusCode;

                    logger.bot(`❌ Conexión cerrada (Código: ${code})`);

                    // Notificar al panel
                    if (this.panelServer) {
                        this.panelServer.setBotStatus(false, null);
                    }

                    // Reconectar si no es un logout intencional
                    if (code !== 401 && !this.isRestarting) {
                        await this.handleReconnect();
                    }
                }
            });

            // Guardar credenciales
            this.sock.ev.on('creds.update', () => {
                saveCreds();
            });

            // Mensajes entrantes
            this.sock.ev.on('messages.upsert', async (update) => {
                if (update.messages.length > 0) {
                    for (const message of update.messages) {
                        if (message.key && !message.key.fromMe) {
                            try {
                                await messageHandler(this.sock, message, this);
                            } catch (error) {
                                logger.critical('Error procesando mensaje', error);
                            }
                        }
                    }
                }
            });

        } catch (error) {
            logger.critical('Error fatal conectando a WhatsApp', error);
            process.exit(1);
        }
    }

    /**
     * Manejar reconexión
     */
    async handleReconnect() {
        if (this.reconnectAttempts >= CONFIG.maxReconnectAttempts) {
            logger.bot('Máximo de intentos de reconexión alcanzado. Deteniendo...');
            process.exit(1);
        }

        this.reconnectAttempts++;
        logger.bot(`Intento de reconexión ${this.reconnectAttempts}/${CONFIG.maxReconnectAttempts}...`);

        await new Promise(resolve => setTimeout(resolve, CONFIG.reconnectInterval));
        await this.connectToWhatsApp();
    }

    /**
     * Notificar al owner
     */
    async notifyOwner(message) {
        if (!CONFIG.ownerNumber) return;

        try {
            const ownerJid = getJid(CONFIG.ownerNumber);
            await this.sock.sendMessage(ownerJid, { text: message });
            logger.bot('Notificación enviada al owner');
        } catch (error) {
            logger.bot(`Error notificando al owner: ${error.message}`);
        }
    }

    /**
     * Notificar al grupo de owners
     */
    async notifyGroup(message) {
        if (!CONFIG.ownerGroupId) return;

        try {
            await this.sock.sendMessage(CONFIG.ownerGroupId, { text: message });
            logger.bot('Notificación enviada al grupo de owners');
        } catch (error) {
            logger.bot(`Error notificando al grupo: ${error.message}`);
        }
    }

    /**
     * Enviar mensaje a un chat
     */
    async sendMessage(jid, text, options = {}) {
        try {
            return await this.sock.sendMessage(jid, { text, ...options });
        } catch (error) {
            logger.error(`Error enviando mensaje: ${error.message}`);
            return null;
        }
    }

    /**
     * Reiniciar el bot
     */
    async restart() {
        if (this.isRestarting) return;

        this.isRestarting = true;
        logger.bot('Reiniciando bot...');

        // Notificar
        await this.notifyOwner('🔄 *XPE Bot reiniciando...*');

        // Cerrar conexión
        if (this.sock) {
            this.sock.end();
        }

        // Cerrar panel
        if (this.panelServer) {
            this.panelServer.close();
        }

        // Reiniciar proceso
        process.exit(0);
    }

    /**
     * Detener el bot
     */
    async stop() {
        logger.bot('Deteniendo bot...');

        if (this.sock) {
            await this.notifyOwner('🛑 *XPE Bot detenido*');
            this.sock.end();
        }

        if (this.panelServer) {
            this.panelServer.close();
        }

        process.exit(0);
    }
}

// ============================================
// Iniciar
// ============================================
const bot = new XPEBot();

// Manejo de señales
process.on('SIGINT', () => bot.stop());
process.on('SIGTERM', () => bot.stop());
process.on('uncaughtException', (error) => {
    logger.critical('Excepción no capturada', error);
    bot.stop();
});

// Iniciar bot
bot.start().catch(error => {
    logger.critical('Error fatal iniciando bot', error);
    process.exit(1);
});

// Exportar para uso en otros módulos
export default bot;
export { XPEBot };
