/**
 * XPE Bot - Servidor del Panel Web
 * API REST y WebSocket para el XPE Panel
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync } from 'fs';

import CONFIG from '../config/settings.js';
import BRANDING from '../config/branding.js';
import logger from '../lib/logger.js';
import { getCommandsByCategory, generateMenu } from '../core/handler.js';
import { getLoadedPlugins } from '../core/loader.js';
import { askXPE } from './ai-service.js';

// ============================================
// Constantes
// ============================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Clase del Servidor del Panel
// ============================================
class PanelServer {
    constructor(botInstance) {
        this.bot = botInstance;
        this.app = express();
        this.httpServer = null;
        this.io = null;
        this.clients = new Set();
    }

    /**
     * Iniciar servidor
     */
    start() {
        return new Promise((resolve, reject) => {
            try {
                // Crear servidor HTTP
                this.httpServer = createServer(this.app);

                // Crear servidor WebSocket
                this.io = new Server(this.httpServer, {
                    cors: {
                        origin: '*',
                        methods: ['GET', 'POST']
                    }
                });

                // Configurar middleware
                this.setupMiddleware();

                // Configurar rutas API
                this.setupRoutes();

                // Configurar WebSocket
                this.setupSocket();

                // Iniciar servidor
                this.httpServer.listen(CONFIG.panelPort, () => {
                    logger.panel(`✅ Panel iniciado en http://localhost:${CONFIG.panelPort}`);
                    resolve(this.httpServer);
                });

            } catch (error) {
                logger.panel(`Error iniciando panel: ${error.message}`);
                reject(error);
            }
        });
    }

    /**
     * Configurar middleware
     */
    setupMiddleware() {
        // JSON parser
        this.app.use(express.json());

        // CORS headers
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            if (req.method === 'OPTIONS') {
                return res.sendStatus(200);
            }
            next();
        });

        // Servir archivos estáticos del panel
        const webDir = path.join(__dirname, '../../web/public');
        if (existsSync(webDir)) {
            this.app.use(express.static(webDir));
        }
    }

    /**
     * Configurar rutas API
     */
    setupRoutes() {
        // === Rutas de Estado ===

        // Estado del bot
        this.app.get('/api/status', (req, res) => {
            res.json({
                success: true,
                bot: {
                    connected: this.bot.isConnected,
                    version: BRANDING.version,
                    name: BRANDING.botName,
                    uptime: process.uptime(),
                    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
                },
                panel: {
                    port: CONFIG.panelPort,
                    clients: this.clients.size
                },
                config: {
                    notifyOnStart: CONFIG.notifyOnStart,
                    notifyOnUpdates: CONFIG.notifyOnUpdates
                }
            });
        });

        // Comandos disponibles
        this.app.get('/api/commands', (req, res) => {
            res.json({
                success: true,
                commands: getCommandsByCategory(),
                menu: generateMenu(),
                prefix: CONFIG.commandPrefix
            });
        });

        // Plugins cargados
        this.app.get('/api/plugins', (req, res) => {
            res.json({
                success: true,
                plugins: getLoadedPlugins()
            });
        });

        // === Rutas de Acciones ===

        // Reiniciar bot
        this.app.post('/api/bot/restart', async (req, res) => {
            try {
                logger.panel('Reinicio solicitado via API');
                await this.bot.restart();
                res.json({ success: true, message: 'Reiniciando...' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Detener bot
        this.app.post('/api/bot/stop', async (req, res) => {
            try {
                logger.panel('Detención solicitada via API');
                await this.bot.stop();
                res.json({ success: true, message: 'Deteniendo...' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Enviar mensaje
        this.app.post('/api/bot/send', async (req, res) => {
            const { jid, message } = req.body;

            if (!jid || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'Faltan parámetros: jid, message'
                });
            }

            try {
                await this.bot.sendMessage(jid, { text: message });
                res.json({ success: true, message: 'Mensaje enviado' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Notificar al grupo de owners
        this.app.post('/api/bot/notify-group', async (req, res) => {
            const { message } = req.body;

            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: 'Falta el mensaje'
                });
            }

            try {
                await this.bot.notifyGroup(message);
                res.json({ success: true, message: 'Notificación enviada' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // === Rutas de XPE Assistant ===

        // Chat con IA
        this.app.post('/api/ai/chat', async (req, res) => {
            const { prompt, userId, context } = req.body;

            if (!prompt) {
                return res.status(400).json({
                    success: false,
                    error: 'Falta el prompt'
                });
            }

            try {
                const result = await askXPE(prompt, userId || 'panel', context);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // === Ruta catch-all para SPA ===
        this.app.get('*', (req, res) => {
            const indexPath = path.join(__dirname, '../../web/public/index.html');
            if (existsSync(indexPath)) {
                res.sendFile(indexPath);
            } else {
                res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${BRANDING.botName} - Panel</title>
                        <style>
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%);
                                color: #fff;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                min-height: 100vh;
                                margin: 0;
                            }
                            .container {
                                text-align: center;
                                padding: 40px;
                            }
                            h1 { color: ${BRANDING.colors.primary}; }
                            .status {
                                background: ${BRANDING.colors.secondary};
                                padding: 20px;
                                border-radius: 12px;
                                margin-top: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>🤖 ${BRANDING.botName}</h1>
                            <p>Panel de Control v${BRANDING.version}</p>
                            <div class="status">
                                <p>🔴 <strong>Bot ${this.bot.isConnected ? 'Conectado' : 'Desconectado'}</strong></p>
                                <p>🌐 Servidor activo en puerto ${CONFIG.panelPort}</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `);
            }
        });
    }

    /**
     * Configurar WebSocket
     */
    setupSocket() {
        this.io.on('connection', (socket) => {
            this.clients.add(socket.id);
            logger.panel(`Cliente conectado: ${socket.id}`);

            // Enviar estado actual
            socket.emit('bot:status', {
                connected: this.bot.isConnected,
                version: BRANDING.version,
                uptime: process.uptime()
            });

            // Solicitud de métricas
            socket.on('metrics:request', () => {
                socket.emit('metrics:update', {
                    uptime: process.uptime(),
                    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    cpu: process.cpuUsage().user
                });
            });

            // Chat con IA
            socket.on('ai:chat', async (data) => {
                const result = await askXPE(data.prompt, data.userId || socket.id, data.context);
                socket.emit('ai:response', result);
            });

            // Solicitud de comandos
            socket.on('commands:request', () => {
                socket.emit('commands:list', {
                    commands: getCommandsByCategory(),
                    menu: generateMenu()
                });
            });

            // Control del bot
            socket.on('bot:restart', async () => {
                logger.panel('Reinicio solicitado via WebSocket');
                this.io.emit('bot:status', { restarting: true });
                await this.bot.restart();
            });

            socket.on('bot:send', async (data) => {
                if (data.to && data.message) {
                    await this.bot.sendMessage(data.to, { text: data.message });
                }
            });

            // Desconexión
            socket.on('disconnect', () => {
                this.clients.delete(socket.id);
                logger.panel(`Cliente desconectado: ${socket.id}`);
            });
        });

        // Emitir métricas cada 5 segundos
        setInterval(() => {
            if (this.clients.size > 0) {
                this.io.emit('metrics:update', {
                    uptime: process.uptime(),
                    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    cpu: process.cpuUsage().user,
                    timestamp: Date.now()
                });
            }
        }, 5000);
    }

    /**
     * Actualizar estado del bot
     */
    setBotStatus(connected, qr = null) {
        this.io.emit('bot:status', {
            connected,
            qr,
            version: BRANDING.version
        });
    }

    /**
     * Emitir log
     */
    sendLog(message, type = 'info') {
        this.io.emit('bot:log', {
            message,
            type,
            timestamp: Date.now()
        });
    }

    /**
     * Cerrar servidor
     */
    close() {
        if (this.httpServer) {
            this.httpServer.close();
            logger.panel('Panel cerrado');
        }
    }
}

// ============================================
// Iniciar servidor
// ============================================
export function startPanelServer(botInstance) {
    const server = new PanelServer(botInstance);
    server.start();
    return server;
}

export default PanelServer;
