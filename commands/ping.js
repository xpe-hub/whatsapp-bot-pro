const { runtime, clockString } = require('../lib/simple')

module.exports = {
    config: {
        name: 'ping',
        aliases: ['ping', 'pong', 'latency'],
        description: 'Verificar latencia del bot',
        category: 'system',
        premium: false,
        owner: false
    },
    
    handler: async (sock, m, { args, body, command, from, isGroup, user, pushName, global }) => {
        try {
            const start = Date.now()
            await sock.sendMessage(from, { text: '🏓 *Pong!*' })
            const end = Date.now()
            const latency = end - start

            const status = latency < 500 ? '🟢' : latency < 1000 ? '🟡' : '🔴'
            
            const response = `🏓 *PING*\n\n${status} *Latencia:* ${latency}ms\n⚡ *Estado:* ${latency < 500 ? 'Excelente' : latency < 1000 ? 'Bueno' : 'Lento'}\n📊 *Tiempo de respuesta:* ${latency}ms\n\n✨ Powered by XPE-TEAM`

            sock.sendMessage(from, { text: response })
        } catch (error) {
            console.error('Error en comando ping:', error)
            sock.sendMessage(from, { text: '❌ *Error al verificar ping*' })
        }
    }
}