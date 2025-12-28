const { runtime } = require('../lib/simple')

module.exports = {
    config: {
        name: 'uptime',
        aliases: ['uptime', 'tiempo', 'running'],
        description: 'Ver tiempo de actividad del bot',
        category: 'system',
        premium: false,
        owner: false
    },
    
    handler: async (sock, m, { args, body, command, from, isGroup, user, pushName, global }) => {
        try {
            const now = Date.now()
            const startTime = global.startTime || now
            const uptime = now - startTime

            const days = Math.floor(uptime / (1000 * 60 * 60 * 24))
            const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((uptime % (1000 * 60)) / 1000)

            const uptimeText = days > 0 ? `${days}d ${hours}h ${minutes}m` : 
                              hours > 0 ? `${hours}h ${minutes}m` : 
                              minutes > 0 ? `${minutes}m ${seconds}s` : 
                              `${seconds}s`

            const status = days > 7 ? '🟢' : days > 3 ? '🟡' : '🔴'
            
            const response = `⏰ *UPTIME*\n\n${status} *Tiempo activo:* ${uptimeText}\n📅 *Iniciado:* ${new Date(startTime).toLocaleString()}\n🔄 *Reinicios:* ${global.restartCount || 0}\n🧠 *Memoria:* ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n\n✨ Powered by XPE-TEAM`

            sock.sendMessage(from, { text: response })
        } catch (error) {
            console.error('Error en comando uptime:', error)
            sock.sendMessage(from, { text: '❌ *Error al verificar uptime*' })
        }
    }
}