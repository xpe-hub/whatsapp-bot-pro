const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidNormalizedUser,
    getContentType,
    downloadMediaMessage
} = require('@whiskeysockets/baileys');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');
const Pino = require('pino');
const chalk = require('chalk');

// ==================== CARGAR CONFIGURACIÓN ====================
require('./settings');

// Cache para mensajes
const msgRetryCounterCache = new NodeCache();

// Store en memoria
const store = makeInMemoryStore({});

// Logger
const logger = Pino({
    level: 'silent'
});

// ==================== UTILIDADES ====================

// Función startsWith segura para RegExp
function startsWith(prefix, text) {
    if (!text) return false;
    if (prefix instanceof RegExp) {
        return prefix.test(text);
    } else if (typeof prefix === 'string') {
        return text.startsWith(prefix);
    }
    return text.startsWith(prefix || '.');
}

// Obtener prefijo como RegExp
function getPrefix() {
    const prefixStr = global.prefix || '.';
    if (typeof prefixStr === 'string') {
        return new RegExp(`^\\${prefixStr}`);
    }
    return prefixStr;
}

// Verificar si es owner
function isOwner(sock, sender) {
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    return ownerJids.includes(sender);
}

// Extraer texto del mensaje (mantiene estructura original de Baileys)
function getMessageText(msg) {
    if (!msg) return '';
    const type = getContentType(msg);
    
    const types = {
        'conversation': msg.conversation,
        'extendedTextMessage': msg.extendedTextMessage?.text || msg.extendedTextMessage?.caption || '',
        'imageMessage': msg.imageMessage?.caption || '',
        'videoMessage': msg.videoMessage?.caption || '',
        'documentMessage': msg.documentMessage?.caption || '',
        'audioMessage': '',
        'stickerMessage': '',
        'contactMessage': '',
        'locationMessage': ''
    };
    
    return types[type] || '';
}

// ==================== AUTO-REACCIONES CON STICKERS ====================

// Cargar configuración de triggers
let stickerTriggers = {};
try {
    const triggerConfig = require('./lib/sticker-triggers.js');
    stickerTriggers = triggerConfig.stickerTriggers || {};
    console.log(chalk.cyan('✅ Sistema de auto-reacciones cargado'));
} catch (e) {
    console.log(chalk.yellow('⚠️  Sistema de auto-reacciones no configurado'));
}

// Obtener sticker aleatorio de una categoría
function getRandomSticker(category) {
    const stickersPath = path.join(__dirname, 'lib', 'stickers', category);
    
    if (!fs.existsSync(stickersPath)) {
        return null;
    }
    
    const files = fs.readdirSync(stickersPath).filter(file => {
        return file.endsWith('.webp') || file.endsWith('.png') || file.endsWith('.jpg');
    });
    
    if (files.length === 0) {
        return null;
    }
    
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return path.join(stickersPath, randomFile);
}

// Detectar categoría basada en el mensaje
function detectStickerCategory(messageText) {
    const normalizedText = messageText.toLowerCase().trim();
    
    for (const [category, keywords] of Object.entries(stickerTriggers)) {
        for (const keyword of keywords) {
            if (normalizedText.includes(keyword.toLowerCase())) {
                return category;
            }
        }
    }
    
    return null;
}

// Manejar auto-reacción con sticker
async function handleAutoReaction(sock, m, text) {
    // Ignorar mensajes del bot mismo
    if (m.key.fromMe) return;
    
    // Ignorar mensajes de estado
    if (m.key.remoteJid === 'status@broadcast') return;
    
    // Ignorar grupos si está deshabilitado (opcional)
    // const isGroup = m.key.remoteJid.endsWith('@g.us');
    // if (isGroup && !global.autoReactGroups) return;
    
    // Detectar si hay trigger
    const category = detectStickerCategory(text);
    
    if (category) {
        const stickerPath = getRandomSticker(category);
        
        if (stickerPath) {
            try {
                const stickerBuffer = fs.readFileSync(stickerPath);
                
                await sock.sendMessage(m.key.remoteJid, {
                    sticker: stickerBuffer,
                    mimetype: 'image/webp'
                });
                
                console.log(chalk.cyan(`🎨 Auto-reacción [${category}] para: "${text.substring(0, 20)}..."`));
            } catch (error) {
                console.log(chalk.red(`❌ Error enviando sticker auto-reacción: ${error.message}`));
            }
        }
    }
}

// ==================== CARGAR COMANDOS ====================
const commands = new Map();
const commandAliases = new Map();

function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    
    if (!fs.existsSync(commandsPath)) {
        console.log(chalk.red('⚠️  No se encontró la carpeta commands/'));
        return;
    }

    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    let loaded = 0;
    
    console.log(chalk.cyan('\n📦 CARGANDO COMANDOS...\n'));
    
    files.forEach(file => {
        try {
            const cmd = require(path.join(commandsPath, file));
            const name = cmd.config?.name?.toLowerCase();
            
            if (name) {
                commands.set(name, cmd);
                console.log(chalk.cyan(`✅ .${name}`));
                loaded++;
                
                if (cmd.config?.aliases) {
                    cmd.config.aliases.forEach(alias => {
                        commandAliases.set(alias.toLowerCase(), name);
                    });
                }
            }
        } catch (error) {
            console.log(chalk.red(`❌ ${file}: ${error.message}`));
        }
    });
    
    console.log(chalk.green(`\n✅ ${loaded} comandos cargados\n`));
}

// ==================== PROCESAR MENSAJE ====================
async function handleMessage(sock, m) {
    try {
        if (!m || !m.message) return;
        
        const jid = jidNormalizedUser(m.key.remoteJid);
        const isGroup = jid.endsWith('@g.us');
        const pushName = m.pushName || 'Usuario';
        const sender = jidNormalizedUser(m.key?.fromMe ? sock.user?.id : m.key?.participant || jid);
        
        // Extraer texto (sin modificar m.message para mantener compatibilidad)
        const text = getMessageText(m.message);
        
        if (!text) return;
        
        // Verificar si es comando
        const prefix = getPrefix();
        const isCmd = startsWith(prefix, text);
        
        // Si NO es comando, verificar auto-reacción
        if (!isCmd) {
            await handleAutoReaction(sock, m, text);
            return;
        }
        
        // Es un comando - procesar normalmente
        const args = text.slice(1).trim().split(/\s+/);
        let commandName = args.shift().toLowerCase();
        
        // Resolver alias
        if (commandAliases.has(commandName)) {
            commandName = commandAliases.get(commandName);
        }
        
        const command = commands.get(commandName);
        
        if (!command) return;
        
        console.log(chalk.cyan(`📝 .${commandName} por ${pushName}`));
        
        // Obtener datos del usuario
        const user = global.getUser ? global.getUser(sender) : { limit: 100, premium: false, ban: false };
        
        // Verificar permisos de owner
        if (command.config?.owner && !isOwner(sock, sender)) {
            await sock.sendMessage(jid, { text: global.msg?.owner || '❌ Solo el propietario' });
            return;
        }
        
        // Verificar permisos premium
        if (command.config?.premium && !user.premium) {
            await sock.sendMessage(jid, { text: global.msg?.premium || '⚠️ Solo premium' });
            return;
        }
        
        // Preparar contexto del mensaje
        const messageContext = {
            ...m,
            chat: jid,
            sender,
            isGroup,
            pushName,
            body: text,
            args,
            command: commandName,
            global
        };
        
        // Ejecutar comando
        try {
            await command.handler(sock, messageContext, {
                args,
                body: text,
                command: commandName,
                from: jid,
                isGroup,
                user,
                pushName,
                global
            });
        } catch (error) {
            console.log(chalk.red(`❌ Error .${commandName}: ${error.message}`));
            await sock.sendMessage(jid, { text: global.msg?.error || '❌ Error' });
        }
        
    } catch (error) {
        console.log(chalk.red(`❌ Error procesando: ${error.message}`));
    }
}

// ==================== CONEXIÓN ====================
async function connectToWhatsApp() {
    console.log(chalk.cyan('╔════════════════════════════════════════╗'));
    console.log(chalk.cyan('║       🚀 INICIANDO XPE-BOT 🚀          ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));
    
    // Cargar comandos
    loadCommands();
    
    // Versión de Baileys
    const { version } = await fetchLatestBaileysVersion();
    console.log(chalk.cyan(`📱 Baileys v${version.join('.')}`));
    console.log(chalk.gray('   Esperando QR...\n'));
    
    // Autenticación
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    // Crear socket
    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        auth: state,
        msgRetryCounterCache,
        syncFullHistory: true,
        generateHighQualityLinkPreview: true,
        shouldSyncHistoryMessage: () => true,
        
        onConnectionOpen: async ({ connection }) => {
            if (connection === 'open') {
                console.log(chalk.green('\n✅ ¡CONECTADO A WHATSAPP!'));
                console.log(chalk.cyan(`🤖 ${global.botname || 'XPE-BOT'} listo\n`));
                console.log(chalk.gray('='.repeat(40)));
                
                // Notificar al owner
                if (global.owner?.[0]) {
                    const ownerJid = global.owner[0][0] + '@s.whatsapp.net';
                    await sock.sendMessage(ownerJid, { 
                        text: '✅ *XPE-BOT* conectado!\nUsa .menu para ver comandos.' 
                    });
                }
            }
        },
        
        onConnectionUpdate: async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const reason = lastDisconnect?.error?.output?.reason || 'Unknown';
                
                console.log(chalk.yellow('\n⚠️  Conexión cerrada'));
                console.log(chalk.gray(`   Razón: ${reason}`));
                
                if (statusCode !== DisconnectReason.loggedOut) {
                    console.log(chalk.cyan('🔄 Reconectando en 3s...\n'));
                    setTimeout(() => connectToWhatsApp(), 3000);
                } else {
                    console.log(chalk.red('❌ Sesión expirada. Escanea QR nuevamente.'));
                }
            }
        },
        
        onCredentialsUpdated: () => {
            console.log(chalk.cyan('🔐 Credenciales actualizadas'));
            saveCreds();
        },
        
        onMessage: async (m) => {
            await handleMessage(sock, m);
        }
    });
    
    // Vincular store
    store.bind(sock.ev);
    
    // Guardar credenciales
    sock.ev.on('creds.update', saveCreds);
}

// ==================== ERRORES ====================
process.on('unhandledRejection', (reason) => {
    console.log(chalk.red('❌ Error:'), reason);
});

process.on('uncaughtException', (err) => {
    console.log(chalk.red('❌ Error:'), err);
});

// ==================== INICIAR ====================
connectToWhatsApp();
