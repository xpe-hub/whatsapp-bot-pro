//━━━━━━━━━━━━━━━[ CONFIGS ]━━━━━━━━━━━━━━━\\
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

global.owner = [
  ['18496393107', 'XPE-TEAM', true],
]

global.mods = []

global.premium = []

global.botname = 'XPE-BOT DEVICE'
global.nameqr = 'XPE-BOT DEVICE'
global.packname = '⪛✰ XPE-BOT DEVICE ✰⪜'
global.author = 'Made With By XPE-TEAM'
global.dev = 'XPE-TEAM'
global.sessionName = 'session'
global.teks = `🌟 *XPE-BOT DEVICE* 🌟\n\n• *Creador*: XPE-TEAM\n• *Versión*: 2.2.5\n• *Tipo*: Multi Device Bot\n\n💫 *Características:*\n• Descarga de música\n• Comandos de multimedia\n• Inteligencia artificial\n• Sistema anti-spam\n\n✨ Powered by XPE-TEAM`
global.teks2 = `*🎵 XPE-BOT MUSIC 🎵*\n\nDescarga la mejor música en alta calidad\nUsa: .play [nombre de la canción]\n\n✨ Powered by XPE-TEAM`

global.APIs = {
  // APIs gratuitas para música y multimedia
  'youtube': 'https://www.youtube.com/watch?v=',
  'spotify': 'https://open.spotify.com/track/',
  'soundcloud': 'https://soundcloud.com/'
}

global.APIKeys = {
  // Aquí van las claves API si las necesitas
  'openai': '',
  'gemini': '',
}

global.chats = new Map()
global.groups = new Map()

//━━━━━━━━━━━━━━━[ FEATURES ]━━━━━━━━━━━━━━━\\
global.welcome = true
global.goodbye = true
global.autoread = true
global.autobio = true
global.autosticker = false

//━━━━━━━━━━━━━━━[ LIMITS ]━━━━━━━━━━━━━━━\\
global.limit = {
  premium: 1000,
  user: 100
}

global.cooldown = {
  premium: 1000,
  user: 3000
}

//━━━━━━━━━━━━━━━[ MESSAGES ]━━━━━━━━━━━━━━━\\
global.msg = {
  wait: '⏳ *Procesando tu solicitud...*',
  success: '✅ *¡Listo!*',
  error: '❌ *Error occurred*',
  premium: '⚠️ *Esta función es solo para usuarios premium*',
  limit: '❌ *Has alcanzado el límite de uso*',
  cooldown: '⏳ *Espera un poco antes de usar otro comando*',
  owner: '❌ *Solo el propietario puede usar este comando*',
  admin: '❌ *Solo los administradores pueden usar este comando*',
  group: '❌ *Este comando solo funciona en grupos*',
  private: '❌ *Este comando solo funciona en chats privados*',
  botAdmin: '❌ *El bot debe ser administrador para usar este comando*',
  args: '❌ *Formato incorrecto*',
  ban: '❌ *Usuario baneado*'
}

//━━━━━━━━━━━━━━━[ DATABASE ]━━━━━━━━━━━━━━━\\
const databasePath = path.join(__dirname, 'database.json')

// Crear archivo de base de datos si no existe
if (!fs.existsSync(databasePath)) {
  fs.writeFileSync(databasePath, JSON.stringify({
    users: {},
    groups: {},
    banned: {},
    premium: {},
    stats: {}
  }, null, 2))
}

global.db = JSON.parse(fs.readFileSync(databasePath, 'utf8'))

//━━━━━━━━━━━━━━━[ DATABASE FUNCTIONS ]━━━━━━━━━━━━━━━\\
global.saveDB = () => {
  fs.writeFileSync(databasePath, JSON.stringify(global.db, null, 2))
}

global.getUser = (id) => {
  if (!global.db.users[id]) {
    global.db.users[id] = {
      limit: global.limit.user,
      cooldown: 0,
      premium: false,
      ban: false
    }
    global.saveDB()
  }
  return global.db.users[id]
}

global.addLimit = (id, amount = 1) => {
  const user = global.getUser(id)
  user.limit += amount
  global.saveDB()
}

global.removeLimit = (id, amount = 1) => {
  const user = global.getUser(id)
  user.limit -= amount
  if (user.limit < 0) user.limit = 0
  global.saveDB()
}

//━━━━━━━━━━━━━━━[ CONNECTS ]━━━━━━━━━━━━━━━\\
global.conns = new Map()

module.exports = {
  global
}