const fs = require('fs')
const path = require('path')

module.exports = {
    config: {
        name: 'help',
        aliases: ['help', 'menu', 'comandos'],
        description: 'Mostrar lista de comandos',
        category: 'system',
        premium: false,
        owner: false
    },
    
    handler: async (sock, m, { args, body, command, from, isGroup, user, pushName, global }) => {
        try {
            const commandsDir = path.join(__dirname, '..', 'commands')
            const categories = {
                system: '🛠️ Sistema',
                multimedia: '🎵 Multimedia',
                fun: '🎮 Diversión',
                utility: '🔧 Utilidades',
                ai: '🤖 IA',
                admin: '👑 Administración'
            }

            let helpText = `🌟 *XPE-BOT COMANDOS* 🌟\n\n`
            helpText += `👋 *Hola ${pushName}!*\n\n`

            // Agrupar comandos por categoría
            const commandsByCategory = {}
            
            if (fs.existsSync(commandsDir)) {
                const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'))
                
                for (const file of files) {
                    try {
                        const cmd = require(path.join(commandsDir, file))
                        const category = cmd.config?.category || 'other'
                        
                        if (!commandsByCategory[category]) {
                            commandsByCategory[category] = []
                        }
                        
                        commandsByCategory[category].push({
                            name: cmd.config?.name || file.replace('.js', ''),
                            aliases: cmd.config?.aliases || [],
                            description: cmd.config?.description || '',
                            premium: cmd.config?.premium || false
                        })
                    } catch (e) {
                        console.error(`Error cargando comando ${file}:`, e)
                    }
                }
            }

            // Mostrar comandos por categoría
            for (const [category, commands] of Object.entries(commandsByCategory)) {
                if (commands.length > 0) {
                    const categoryName = categories[category] || `📁 ${category.toUpperCase()}`
                    helpText += `*${categoryName}*\n`
                    
                    for (const cmd of commands.slice(0, 8)) { // Máximo 8 comandos por categoría
                        const aliasText = cmd.aliases.length > 0 ? ` (${cmd.aliases.slice(0, 2).join(', ')})` : ''
                        const premiumText = cmd.premium ? ' 🔒' : ''
                        helpText += `• .${cmd.name}${aliasText}${premiumText}\n`
                    }
                    
                    if (commands.length > 8) {
                        helpText += `• ... y ${commands.length - 8} más\n`
                    }
                    
                    helpText += `\n`
                }
            }

            helpText += `📱 *Comandos de uso:*\n` +
                       `• .play [música] - Descargar música\n` +
                       `• .ping - Verificar latencia\n` +
                       `• .uptime - Tiempo activo\n` +
                       `• .info - Información del bot\n\n` +
                       `💡 *Tips:*\n` +
                       `• Usa .play seguido del nombre de la canción\n` +
                       `• Todos los comandos usan el prefijo "."\n` +
                       `• Los comandos premium están marcados con 🔒\n\n` +
                       `✨ Powered by XPE-TEAM`

            sock.sendMessage(from, { text: helpText })
        } catch (error) {
            console.error('Error en comando help:', error)
            sock.sendMessage(from, { text: '❌ *Error al mostrar ayuda*' })
        }
    }
}