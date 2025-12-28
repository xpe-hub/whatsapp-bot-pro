const { fetchBuffer } = require('../lib/functions')

module.exports = {
    config: {
        name: 'sticker',
        aliases: ['sticker', 'stiker', 'stick'],
        description: 'Crear sticker desde imagen',
        category: 'multimedia',
        premium: false,
        owner: false
    },
    
    handler: async (sock, m, { args, body, command, from, isGroup, user, pushName, global }) => {
        try {
            const quoted = m.quoted || m
            let media = null

            // Verificar si hay imagen en el mensaje
            if (quoted.msg?.imageMessage) {
                media = quoted.msg.imageMessage
            } else if (quoted.msg?.documentMessage && quoted.msg.documentMessage.mimetype.startsWith('image/')) {
                media = quoted.msg.documentMessage
            } else {
                return sock.sendMessage(from, { 
                    text: '📸 *Envía una imagen para crear sticker*\n\n*Uso:* Responde a una imagen con .sticker' 
                })
            }

            await sock.sendMessage(from, { 
                text: '🔄 *Creando sticker...*' 
            })

            // Descargar imagen
            const buffer = await m.downloadMediaMessage(media, 'sticker', false)
            
            if (!buffer) {
                return sock.sendMessage(from, { 
                    text: '❌ *Error al descargar la imagen*' 
                })
            }

            // Enviar sticker
            await sock.sendMessage(from, {
                sticker: buffer,
                mimetype: 'image/webp'
            })

        } catch (error) {
            console.error('Error en comando sticker:', error)
            sock.sendMessage(from, { 
                text: '❌ *Error al crear sticker*' 
            })
        }
    }
}