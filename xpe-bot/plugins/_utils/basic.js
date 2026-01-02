/**
 * XPE Bot - Plugin de Utilidades Básicas
 * Comandos esenciales para el funcionamiento del bot
 */

export default function utilsPlugin(registerCommand) {
    // ========================================
    // Comando: ping
    // Verificar si el bot está activo
    // ========================================
    registerCommand(
        'ping',
        async (sock, message, args, fullArgs, bot) => {
            const startTime = Date.now();
            await sock.sendMessage(message.key.remoteJid, {
                react: { text: '🏓', key: message.key }
            });

            const endTime = Date.now();
            const latency = endTime - startTime;

            const response = `╔══════════════════════════════════════╗
║            🏓 PONG! 🏓               ║
╚══════════════════════════════════════╝

⚡ *Latencia:* ${latency}ms
💾 *Memoria:* ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
⏱️ *Uptime:* ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m
🟢 *Estado:* Conectado

_${new Date().toLocaleString('es-ES')}_`;

            await sock.sendMessage(message.key.remoteJid, { text: response });
        },
        {
            description: 'Verificar si el bot está activo',
            category: 'Utilidades',
            usage: '!ping'
        }
    );

    // ========================================
    // Comando: menu
    // Mostrar menú de comandos
    // ========================================
    registerCommand(
        'menu',
        async (sock, message, args, fullArgs, bot) => {
            const menuNumber = args[0] || '1';
            const { generateMenu } = await import('../core/handler.js');

            const response = generateMenu();

            await sock.sendMessage(message.key.remoteJid, {
                text: response
            });
        },
        {
            description: 'Mostrar el menú de comandos',
            category: 'Utilidades',
            usage: '!menu [categoría]'
        }
    );

    // ========================================
    // Comando: ayuda
    // Ayuda específica de un comando
    // ========================================
    registerCommand(
        'ayuda',
        async (sock, message, args, fullArgs, bot) => {
            const commandName = args[0];
            const { findCommand } = await import('../core/handler.js');

            if (!commandName) {
                const response = `╔══════════════════════════════════════╗
║        📖 AYUDA DE XPE BOT           ║
╚══════════════════════════════════════╝

✨ *Comandos disponibles:*

• !menu - Ver todos los comandos
• !ping - Verificar estado del bot
• !ayuda [comando] - Ayuda específica

🌐 Para más información, visita:
${'https://github.com/xpe-systems/xpe-bot'}`;

                await sock.sendMessage(message.key.remoteJid, { text: response });
                return;
            }

            const cmd = findCommand(commandName);

            if (!cmd) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: `❌ *Comando no encontrado:* "${commandName}"`
                });
                return;
            }

            const response = `╔══════════════════════════════════════╗
║       📖 AYUDA: ${cmd.command.toUpperCase()}           ║
╚══════════════════════════════════════╝

📝 *Descripción:* ${cmd.description}
📂 *Categoría:* ${cmd.category}
🔧 *Uso:* ${cmd.usage}

${cmd.ownerOnly ? '🔐 Solo el owner puede usar este comando' : ''}
${cmd.adminOnly ? '🛡️ Requiere ser administrador' : ''}
${cmd.groupOnly ? '👥 Solo funciona en grupos' : ''}`;

            await sock.sendMessage(message.key.remoteJid, { text: response });
        },
        {
            description: 'Mostrar ayuda de un comando específico',
            category: 'Utilidades',
            usage: '!ayuda [comando]',
            aliases: ['help']
        }
    );

    // ========================================
    // Comando: estado
    // Información del sistema
    // ========================================
    registerCommand(
        'estado',
        async (sock, message, args, fullArgs, bot) => {
            const memoryUsage = process.memoryUsage();
            const uptime = process.uptime();

            const response = `╔══════════════════════════════════════╗
║       📊 ESTADO DEL SISTEMA         ║
╚══════════════════════════════════════╝

🤖 *Bot:* XPE Bot v1.0.0
🟢 *Estado:* ${bot.isConnected ? 'Conectado' : 'Desconectado'}
⏱️ *Uptime:* ${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m

💾 *Memoria:*
   • Heap: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB
   • RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)}MB
   • Externa: ${Math.round(memoryUsage.external / 1024 / 1024)}MB

🖥️ *Sistema:*
   • Node.js: ${process.version}
   • Plataforma: ${process.platform}
   • PID: ${process.pid}`;

            await sock.sendMessage(message.key.remoteJid, { text: response });
        },
        {
            description: 'Mostrar información del sistema',
            category: 'Utilidades',
            usage: '!estado',
            aliases: ['status', 'stats']
        }
    );
}
