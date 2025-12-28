const { youtubeSearch, ytdl } = require('bochilteam/scraper')
const { fetchBuffer, formatSize } = require('../lib/functions')

module.exports = {
    config: {
        name: 'play',
        aliases: ['musica', 'song', 'play'],
        description: 'Descargar música desde YouTube',
        category: 'multimedia',
        premium: false,
        owner: false
    },
    
    handler: async (sock, m, { args, body, command, from, isGroup, user, pushName, global }) => {
        try {
            if (!args.length) {
                return sock.sendMessage(from, { 
                    text: `🎵 *XPE-BOT MUSIC* 🎵\n\n*Uso:* .play [nombre de la canción]\n\n*Ejemplo:* .play Shape of You\n\n✨ Powered by XPE-TEAM` 
                })
            }

            const query = args.join(' ')
            await sock.sendMessage(from, { text: '🔍 *Buscando música...*' })

            // Buscar en YouTube
            const search = await youtubeSearch(query)
            if (!search || !search.video || !search.video.length) {
                return sock.sendMessage(from, { 
                    text: '❌ *No se encontró música con ese nombre*' 
                })
            }

            const video = search.video[0]
            const { id, title, thumbnail, duration, views, published } = video

            await sock.sendMessage(from, { 
                text: `🎵 *Encontrada:*\n\n📌 *Título:* ${title}\n⏱️ *Duración:* ${duration}\n👀 *Visualizaciones:* ${views}\n📅 *Publicada:* ${published}\n\n⏳ *Descargando...*` 
            })

            // Descargar audio
            const audio = await ytdl(id, { type: 'audio', quality: 128 })
            
            if (!audio) {
                return sock.sendMessage(from, { 
                    text: '❌ *Error al descargar la música*' 
                })
            }

            // Enviar información del archivo
            const fileInfo = `🎵 *${title}*\n\n📁 *Tamaño:* ${formatSize(audio.byteLength)}\n🎧 *Calidad:* 128kbps\n⏱️ *Duración:* ${duration}\n\n✨ *Powered by XPE-TEAM*`

            await sock.sendMessage(from, { 
                text: fileInfo 
            })

            // Enviar audio
            await sock.sendMessage(from, {
                audio: audio,
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            })

        } catch (error) {
            console.error('Error en comando play:', error)
            sock.sendMessage(from, { 
                text: '❌ *Error al buscar música. Intenta con otro nombre.*' 
            })
        }
    }
}