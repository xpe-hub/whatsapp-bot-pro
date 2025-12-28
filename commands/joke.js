const jokes = [
    "¿Por qué los programadores prefieren el modo oscuro? ¡Porque la luz atrae a los bugs!",
    "¿Qué le dice un .js a un .html? ¡Sin ti no sé qué haría!",
    "¿Cuál es la diferencia entre un programador y un mago? El mago hace que las cosas desaparezcan, el programador hace que aparezcan errores.",
    "¿Por qué los bots nunca se cansan? ¡Porque funcionan con electricidad, no con café!",
    "¿Qué hace un bot cuando está triste? ¡Se reinicia para sentirse mejor!",
    "¿Por qué los bots son tan buenos en matemáticas? ¡Porque siempre calculan en binario!",
    "¿Cuál es la diferencia entre un bot y un humano? El bot nunca se olvida de sus tareas.",
    "¿Qué le dice un bot a otro bot en una fiesta? ¡Vamos a hacer un update de nuestras conversaciones!",
    "¿Por qué los bots son los mejores amigos? ¡Porque nunca juzgarán tus comandos!",
    "¿Qué hace un bot cuando encuentra un error? ¡Lo reporta inmediatamente!"
]

module.exports = {
    config: {
        name: 'joke',
        aliases: ['joke', 'chiste', 'chistes'],
        description: 'Contar chistes aleatorios',
        category: 'fun',
        premium: false,
        owner: false
    },
    
    handler: async (sock, m, { args, body, command, from, isGroup, user, pushName, global }) => {
        try {
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)]
            
            const response = `😄 *CHISTE*\n\n${randomJoke}\n\n🎭 *Powered by XPE-TEAM*`
            
            sock.sendMessage(from, { text: response })
        } catch (error) {
            console.error('Error en comando joke:', error)
            sock.sendMessage(from, { text: '❌ *Error al contar chiste*' })
        }
    }
}