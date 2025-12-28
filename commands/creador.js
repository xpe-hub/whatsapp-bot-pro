const fs = require('fs')
const path = require('path')

module.exports = {
    config: {
        name: 'creador',
        aliases: ['creador', 'owner', 'propietario', 'prop', 'autor', 'developer'],
        description: 'Muestra información de contacto del creador',
        category: 'system',
        premium: false,
        owner: false
    },
    
    handler: async (sock, m, { args, body, command, from, isGroup, user, pushName, global }) => {
        try {
            // Obtener datos del owner desde settings.js
            const ownerData = global.owner?.[0] || ['18496393107', 'XPE-TEAM', true]
            const ownerNumber = ownerData[0]
            const ownerName = ownerData[1] || 'XPE-TEAM'
            
            // Generar vCard
            const vcard = 'BEGIN:VCARD\n' +
                'VERSION:3.0\n' +
                `FN:${ownerName}\n` +
                `ORG:XPE Systems;\n` +
                `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\n` +
                'END:VCARD'
            
            const contactMessage = `╭━━━✦ *CONTACTO CREADOR* ✦━━━╮
┃
┃ 📞 *${ownerName}*
┃
┃ Si tienes dudas, preguntas o
┃ sugerencias sobre el bot,
┃ puedes contactar a mi creador.
┃
┃ 💬 *Mensaje directo:*
┃ Pulsa sobre el contacto y
┃ chatea directamente.
┃
╰━━━✦ *${global.botname || 'XPE-BOT'}* ✦━━━╯`
            
            // Enviar vCard
            await sock.sendMessage(from, {
                contacts: {
                    displayName: ownerName,
                    contacts: [{ vcard }]
                }
            })
            
            // Enviar mensaje informativo
            await sock.sendMessage(from, { text: contactMessage })
            
        } catch (error) {
            console.error('Error en comando creador:', error)
            await sock.sendMessage(from, { text: '❌ *Error al enviar contacto*' })
        }
    }
}
