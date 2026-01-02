/**
 * XPE Bot - Manejador de Mensajes
 * Procesa todos los mensajes entrantes y los dirige a los plugins correspondientes
 */

import { parseArgs, isGroup, isOwner, replyError, react } from '../lib/utils.js';
import logger from '../lib/logger.js';
import CONFIG from '../config/settings.js';
import BRANDING from '../config/branding.js';

// ============================================
// Mapa de comandos cargados
// ============================================
export const commands = new Map();

/**
 * Registrar un comando
 */
export function registerCommand(command, handler, options = {}) {
    const cmd = {
        command: command.toLowerCase(),
        aliases: (options.aliases || []).map(a => a.toLowerCase()),
        description: options.description || 'Sin descripción',
        category: options.category || 'general',
        usage: options.usage || `${CONFIG.commandPrefix}${command}`,
        ownerOnly: options.ownerOnly || false,
        adminOnly: options.adminOnly || false,
        groupOnly: options.groupOnly || false,
        privateOnly: options.privateOnly || false,
        execute: handler
    };

    // Registrar comando principal
    commands.set(cmd.command, cmd);

    // Registrar aliases
    cmd.aliases.forEach(alias => {
        commands.set(alias, cmd);
    });

    return cmd;
}

/**
 * Procesar mensaje entrante
 */
export async function messageHandler(sock, message, botInstance) {
    if (!message.message) return;

    // Extraer contenido del mensaje
    const messageContent = message.message.conversation ||
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption ||
        message.message.documentMessage?.caption || '';

    // Ignorar mensajes vacíos
    if (!messageContent.trim()) return;

    // Obtener JID del remitente
    const sender = message.key.remoteJid;
    const senderNumber = sender.replace(/@.*$/, '');
    const isFromMe = message.key.fromMe;

    // Ignorar mensajes del propio bot
    if (isFromMe) return;

    // Verificar si es un comando
    const prefix = CONFIG.commandPrefix;
    if (!messageContent.startsWith(prefix)) return;

    // Parsear comando y argumentos
    const { command, args, fullArgs } = parseArgs(messageContent, prefix);

    // Verificar si el comando existe
    if (!commands.has(command)) {
        // Comando no reconocido - opcionalmente responder
        return;
    }

    const cmd = commands.get(command);
    const isFromGroup = isGroup(sender);

    // Verificar permisos
    try {
        // Owner only
        if (cmd.ownerOnly && !isOwner(sender)) {
            await replyError(sock, message, BRANDING.messages.ownerOnly);
            await react(sock, message, '🛡️');
            return;
        }

        // Group only
        if (cmd.groupOnly && !isFromGroup) {
            await replyError(sock, message, 'Este comando solo funciona en grupos');
            await react(sock, message, '👥');
            return;
        }

        // Private only
        if (cmd.privateOnly && isFromGroup) {
            await replyError(sock, message, BRANDING.messages.privateOnly);
            await react(sock, message, '🔒');
            return;
        }

        // Admin only (para grupos)
        if (cmd.adminOnly && isFromGroup) {
            try {
                const groupMetadata = await sock.groupMetadata(sender);
                const isAdmin = groupMetadata.participants.some(
                    p => p.id === sender && p.admin
                );
                if (!isAdmin && !isOwner(sender)) {
                    await replyError(sock, message, BRANDING.messages.adminOnly);
                    await react(sock, message, '🛡️');
                    return;
                }
            } catch (error) {
                logger.warn(`Error verificando admin: ${error.message}`);
            }
        }

        // Log del comando
        logger.command(command, senderNumber, isFromGroup ? sender : 'private');

        // Ejecutar comando
        await cmd.execute(sock, message, args, fullArgs, botInstance);

        // Reacción de éxito
        await react(sock, message, '✅');

    } catch (error) {
        logger.critical(`Error ejecutando comando ${command}`, error);
        await replyError(sock, message, `Error ejecutando: ${error.message}`);
        await react(sock, message, '❌');
    }
}

/**
 * Obtener lista de comandos
 */
export function getCommandList() {
    const list = [];
    commands.forEach((cmd, key) => {
        if (key === cmd.command) { // Solo comando principal, no aliases
            list.push({
                command: cmd.command,
                description: cmd.description,
                category: cmd.category,
                usage: cmd.usage
            });
        }
    });
    return list;
}

/**
 * Obtener comandos por categoría
 */
export function getCommandsByCategory() {
    const categories = {};
    commands.forEach((cmd, key) => {
        if (key === cmd.command) {
            if (!categories[cmd.category]) {
                categories[cmd.category] = [];
            }
            categories[cmd.category].push({
                command: cmd.command,
                description: cmd.description,
                usage: cmd.usage
            });
        }
    });
    return categories;
}

/**
 * Buscar comando
 */
export function findCommand(query) {
    query = query.toLowerCase();

    // Buscar por comando exacto
    if (commands.has(query)) {
        return commands.get(query);
    }

    // Buscar por alias
    let found = null;
    commands.forEach((cmd, key) => {
        if (key === cmd.command) {
            if (cmd.aliases.includes(query) ||
                cmd.description.toLowerCase().includes(query)) {
                found = cmd;
            }
        }
    });

    return found;
}

/**
 * Generar menú de comandos formateado
 */
export function generateMenu(includePrivate = false) {
    const categories = getCommandsByCategory();

    let menu = `╔══════════════════════════════════════╗\n`;
    menu += `║     📋 *MENÚ DE COMANDOS XPE*        ║\n`;
    menu += `║     ${BRANDING.botName} v${BRANDING.version}          ║\n`;
    menu += `╚══════════════════════════════════════╝\n\n`;

    for (const [category, cmds] of Object.entries(categories)) {
        menu += `*━━━ ${category.toUpperCase()} ━━━*\n`;

        cmds.forEach(cmd => {
            const isOwner = cmd.usage.includes('owner') || cmd.usage.includes('update');
            const icon = isOwner ? '🔐' : '⚡';
            menu += `${icon} *${cmd.usage}*\n   └─ ${cmd.description}\n`;
        });

        menu += '\n';
    }

    menu += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    menu += `📖 *Ayuda detallada:* ${CONFIG.commandPrefix}ayuda [comando]\n`;
    menu += `🌐 *Panel de Control:* http://localhost:${3000}\n`;
    menu += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    menu += `*${BRANDING.botName}* | Tu asistente de WhatsApp\n`;

    return menu;
}

export default {
    registerCommand,
    messageHandler,
    getCommandList,
    getCommandsByCategory,
    findCommand,
    generateMenu,
    commands
};
