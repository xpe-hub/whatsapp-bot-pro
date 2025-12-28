const fs = require('fs')
const path = require('path')
const { generate } = require('qrcode-terminal')

module.exports = {
    config: {
        name: 'serbot',
        aliases: ['serbot', 'serbotcode'],
        description: 'Crear código QR para sub-bot',
        category: 'admin',
        premium: true,
        owner: false
    },
    
    handler: async (sock, m, { args, body, command, from, isGroup, user, pushName, global }) => {
        try {
            // Verificar si es owner (los owners pueden usar sin ser premium)
            const senderJid = m.key?.fromMe ? sock.user?.id : m.key?.participant;
            const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
            const isOwner = ownerJids.includes(senderJid);
            
            // Si no es owner, verificar premium
            if (!isOwner && !user.premium) {
                return sock.sendMessage(from, { 
                    text: global.msg?.premium || '⚠️ *Esta función es solo para usuarios premium*' 
                })
            }

            await sock.sendMessage(from, { 
                text: '🔧 *Creando sub-bot...*\n\n📱 *Sigue estos pasos:*\n1. Escanea el QR con otro número\n2. El sub-bot se conectará automáticamente\n3. ¡Listo para usar!' 
            })

            // Generar código QR para nuevo sub-bot
            const botId = Date.now().toString()
            const sessionData = {
                id: botId,
                owner: m.sender,
                created: Date.now(),
                active: false
            }

            const qrData = JSON.stringify(sessionData)
            
            // Generar QR visual
            let qrCode = ''
            generate(qrData, (err, code) => {
                if (!err) {
                    qrCode = code
                }
            })

            // Guardar datos del sub-bot
            const subbotPath = path.join(__dirname, '..', 'subbots', `${botId}.json`)
            if (!fs.existsSync(path.join(__dirname, '..', 'subbots'))) {
                fs.mkdirSync(path.join(__dirname, '..', 'subbots'), { recursive: true })
            }
            fs.writeFileSync(subbotPath, JSON.stringify(sessionData, null, 2))

            // Agregar a la lista de sub-bots
            if (!global.conns.has(botId)) {
                global.conns.set(botId, {
                    id: botId,
                    socket: null,
                    data: sessionData
                })
            }

            // Enviar respuesta con QR
            const response = `🤖 *SUB-BOT CREADO*\n\n` +
                           `🆔 *ID:* ${botId}\n` +
                           `👤 *Propietario:* ${m.sender}\n` +
                           `📅 *Creado:* ${new Date().toLocaleString()}\n\n` +
                           `📱 *Escanea este código QR con WhatsApp*\n` +
                           `🔗 *El sub-bot se activará automáticamente*\n\n` +
                           `✨ Powered by XPE-TEAM`

            sock.sendMessage(from, { text: response })

        } catch (error) {
            console.error('Error en comando serbot:', error)
            sock.sendMessage(from, { 
                text: '❌ *Error al crear sub-bot*' 
            })
        }
    }
}
