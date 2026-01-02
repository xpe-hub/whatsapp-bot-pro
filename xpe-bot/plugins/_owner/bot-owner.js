/**
 * XPE Bot - Plugin de Owner
 * Comandos exclusivos para el propietario del bot
 */

import { getOwnerNumber, getJid } from '../config/settings.js';
import BRANDING from '../config/branding.js';

export default function ownerPlugin(registerCommand) {
    // ========================================
    // Comando: restart
    // Reiniciar el bot
    // ========================================
    registerCommand(
        'restart',
        async (sock, message, args, fullArgs, bot) => {
            const chatJid = message.key.remoteJid;
            const senderJid = message.key.participant || message.key.remoteJid;

            await sock.sendMessage(chatJid, {
                text: '🔄 *XPE Bot reiniciando...*',
                contextInfo: { mentionedJid: [senderJid] }
            });

            await bot.restart();
        },
        {
            description: 'Reiniciar el bot',
            category: 'Dueño del Bot',
            usage: '!restart',
            ownerOnly: true
        }
    );

    // ========================================
    // Comando: stop
    // Detener el bot completamente
    // ========================================
    registerCommand(
        'stop',
        async (sock, message, args, fullArgs, bot) => {
            const chatJid = message.key.remoteJid;
            const senderJid = message.key.participant || message.key.remoteJid;

            await sock.sendMessage(chatJid, {
                text: '🛑 *XPE Bot deteniéndose...*',
                contextInfo: { mentionedJid: [senderJid] }
            });

            await bot.stop();
        },
        {
            description: 'Detener el bot',
            category: 'Dueño del Bot',
            usage: '!stop',
            ownerOnly: true
        }
    );

    // ========================================
    // Comando: broadcast
    // Enviar mensaje a todos los chats
    // ========================================
    registerCommand(
        'broadcast',
        async (sock, message, args, fullArgs, bot) => {
            const senderJid = message.key.participant || message.key.remoteJid;

            if (!fullArgs.trim()) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: '📢 *Broadcast*

使用方法: !broadcast [mensaje]

⚠️ *Warning:* Este comando enviará el mensaje a todos los chats del bot.',
                    contextInfo: { mentionedJid: [senderJid] }
                });
                return;
            }

            // Notificar inicio
            await sock.sendMessage(message.key.remoteJid, {
                text: '📢 *Broadcast iniciado...*\nEste proceso puede tomar unos minutos.',
                contextInfo: { mentionedJid: [senderJid] }
            });

            // Aquí iría la lógica para enviar a todos los chats
            // Por seguridad, solo enviamos al owner y grupo de owners
            const ownerJid = getJid(getOwnerNumber());

            await sock.sendMessage(ownerJid, {
                text: `📢 *BROADCAST*\n\n${fullArgs}`
            });

            if (process.env.OWNER_GROUP_ID) {
                await sock.sendMessage(process.env.OWNER_GROUP_ID, {
                    text: `📢 *BROADCAST*\n\n${fullArgs}`
                });
            }

            await sock.sendMessage(message.key.remoteJid, {
                text: '✅ *Broadcast completado*',
                contextInfo: { mentionedJid: [senderJid] }
            });
        },
        {
            description: 'Enviar mensaje a todos los chats',
            category: 'Dueño del Bot',
            usage: '!broadcast [mensaje]',
            ownerOnly: true,
            aliases: ['bc', 'anunciar']
        }
    );

    // ========================================
    // Comando: leave
    // Salir de un grupo
    // ========================================
    registerCommand(
        'leave',
        async (sock, message, args, fullArgs, bot) => {
            const chatJid = message.key.remoteJid;
            const senderJid = message.key.participant || message.key.remoteJid;

            // Verificar que sea un grupo
            if (!chatJid.endsWith('@g.us')) {
                await sock.sendMessage(chatJid, {
                    text: '❌ *Error:* Este comando solo funciona en grupos.',
                    contextInfo: { mentionedJid: [senderJid] }
                });
                return;
            }

            await sock.sendMessage(chatJid, {
                text: '👋 *XPE Bot sale del grupo*\n\nGracias por usar el bot. ¡Hasta luego!',
                contextInfo: { mentionedJid: [senderJid] }
            });

            await sock.groupLeave(chatJid);
        },
        {
            description: 'Salir del grupo actual',
            category: 'Dueño del Bot',
            usage: '!leave',
            ownerOnly: true,
            aliases: ['salir', 'leave-group']
        }
    );

    // ========================================
    // Comando: panel
    // Obtener enlace del panel web
    // ========================================
    registerCommand(
        'panel',
        async (sock, message, args, fullArgs, bot) => {
            const senderJid = message.key.participant || message.key.remoteJid;
            const panelUrl = `http://localhost:${3000}`;

            const response = `╔══════════════════════════════════════╗
║         🌐 XPE PANEL                  ║
╚══════════════════════════════════════╝

📊 *Panel de Control:* ${panelUrl}

✨ *Características:*
• 📈 Métricas en tiempo real
• 📝 Logs del sistema
• ⚙️ Configuración
• 🤖 Control del bot
• 💬 XPE Assistant

🔐 *Token:* (configurado en el servidor)`;

            await sock.sendMessage(message.key.remoteJid, {
                text: response,
                contextInfo: { mentionedJid: [senderJid] }
            });
        },
        {
            description: 'Obtener enlace del panel web',
            category: 'Dueño del Bot',
            usage: '!panel',
            ownerOnly: true,
            aliases: ['web', 'dashboard']
        }
    );

    // ========================================
    // Comando: setprefix
    // Cambiar prefijo de comandos
    // ========================================
    registerCommand(
        'setprefix',
        async (sock, message, args, fullArgs, bot) => {
            const senderJid = message.key.participant || message.key.remoteJid;

            const newPrefix = args[0];

            if (!newPrefix || newPrefix.length !== 1) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: '🔧 *Cambiar Prefijo*

使用方法: !setprefix [nuevo caracter]

📝 *Ejemplo:* !setprefix .

⚠️ *Nota:* El cambio es temporal. Para hacerlo permanente, edita el archivo .env',
                    contextInfo: { mentionedJid: [senderJid] }
                });
                return;
            }

            // Nota: Esto requeriría actualizar CONFIG
            await sock.sendMessage(message.key.remoteJid, {
                text: `⚠️ *Cambio de prefijo*

El prefijo no puede cambiarse en tiempo real por seguridad.
Edita XPE_COMMAND_PREFIX en el archivo .env y reinicia el bot.`,
                contextInfo: { mentionedJid: [senderJid] }
            });
        },
        {
            description: 'Cambiar prefijo de comandos',
            category: 'Dueño del Bot',
            usage: '!setprefix [caracter]',
            ownerOnly: true,
            aliases: ['prefix']
        }
    );

    // ========================================
    // Comando: owner
    // Información del owner
    // ========================================
    registerCommand(
        'owner',
        async (sock, message, args, fullArgs, bot) => {
            const ownerNumber = getOwnerNumber();

            const response = `╔══════════════════════════════════════╗
║           👤 OWNER INFO              ║
╚══════════════════════════════════════╝

🤖 *Bot:* ${BRANDING.botName}
👤 *Owner:* ${ownerNumber}
🌐 *Web:* ${BRANDING.website}
📱 *WhatsApp:* wa.me/${ownerNumber}

✨ *XPE Systems - Automatización Profesional*`;

            await sock.sendMessage(message.key.remoteJid, { text: response });
        },
        {
            description: 'Información del propietario del bot',
            category: 'Dueño del Bot',
            usage: '!owner',
            aliases: ['creator', 'dev']
        }
    );
}
