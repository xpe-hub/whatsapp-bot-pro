const { formatSize } = require('../lib/functions')
const { clockString } = require('../lib/simple')
const os = require('os')
const { performance } = require('perf_hooks')

module.exports = {
    config: {
        name: 'info',
        aliases: ['info', 'bot', 'about', 'informacion', 'status', 'estado'],
        description: 'Muestra información detallada del bot',
        category: 'system',
        premium: false,
        owner: false
    },
    
    handler: async (sock, m, { args, body, command, from, isGroup, user, pushName, global }) => {
        try {
            // Calcular ping
            const t1 = performance.now()
            await new Promise(r => setTimeout(r, 100))
            const t2 = performance.now()
            const ping = (t2 - t1 - 100).toFixed(2)
            
            // Memoria usada
            const memoryUsage = process.memoryUsage()
            const ramUsed = formatSize(memoryUsage.heapUsed)
            const ramTotal = formatSize(memoryUsage.heapTotal)
            
            // Tiempo activo
            const uptime = clockString(process.uptime() * 1000)
            
            const infoText = `╭━━━✦ *INFO XPE-BOT* ✦━━━╮
┃
┃ 🌟 *${global.botname || 'XPE-BOT DEVICE'}*
┃ ⚡ Versión: 2.2.5
┃ 📱 Tipo: Multi Device Bot
┃
╠━━━✦ *ESTADO* ✦━━━╯
┃ 🟢 Estado: Activo / Online
┃ 🚀 Ping: ${Math.abs(ping)}ms
┃ ⏱️ Uptime: ${uptime}
┃ 💾 RAM: ${ramUsed} / ${ramTotal}
┃
╠━━━✦ *SISTEMA* ✦━━━╯
┃ 🤖 Node.js: ${process.version}
┃ ⚙️ Plataforma: ${process.platform}
┃ 📦 Baileys MD
┃
╠━━━✦ *VERSIONES* ✦━━━╯
┃ 🔹 *Lite/Público:*
┃    Versión ligera sin subbots
┃    Ideal para uso personal
┃
┃ 🔸 *Prime/Privada:*
┃    Sistema avanzado de subbots
┃    + Funciones premium
┃    + Soporte prioritario
┃
╠━━━✦ *CREADOR* ✦━━━╯
┃ 👤 XPE-TEAM
┃ 📞 Usa *.creador* para contacto
┃
╰━━━✦ *${global.botname || 'XPE-BOT'}* ✦━━━╯
   ✨ Powered by XPE-TEAM`

            await sock.sendMessage(from, { text: infoText })
            
        } catch (error) {
            console.error('Error en comando info:', error)
            await sock.sendMessage(from, { text: '❌ *Error al mostrar información*' })
        }
    }
}
