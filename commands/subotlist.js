const fs = require('fs')
const path = require('path')

module.exports = {
    config: {
        name: 'subotlist',
        aliases: ['subotlist', 'subbots', 'listbot'],
        description: 'Ver lista de sub-bots activos',
        category: 'admin',
        premium: false,
        owner: false
    },
    
    handler: async (sock, m, { args, body, command, from, isGroup, user, pushName, global }) => {
        try {
            if (!global.conns || global.conns.size === 0) {
                return sock.sendMessage(from, { 
                    text: '🤖 *No hay sub-bots activos*\n\nUsa .serbot para crear uno nuevo.' 
                })
            }

            let listText = `🤖 *SUB-BOTS ACTIVOS* 🤖\n\n`
            let count = 1

            for (const [botId, botData] of global.conns) {
                const status = botData.socket ? '🟢' : '🔴'
                const uptime = botData.data?.created ? 
                    Math.floor((Date.now() - botData.data.created) / 60000) + 'm' : 'N/A'
                
                listText += `${count}. ${status} *Bot ${botId}*\n`
                listText += `   👤 Propietario: ${botData.data?.owner || 'N/A'}\n`
                listText += `   ⏰ Uptime: ${uptime}\n`
                listText += `   🔧 Estado: ${botData.socket ? 'Conectado' : 'Desconectado'}\n\n`
                count++
            }

            listText += `📊 *Total:* ${global.conns.size} sub-bot(s)\n\n` +
                       `✨ Powered by XPE-TEAM`

            sock.sendMessage(from, { text: listText })

        } catch (error) {
            console.error('Error en comando subotlist:', error)
            sock.sendMessage(from, { 
                text: '❌ *Error al obtener lista de sub-bots*' 
            })
        }
    }
}