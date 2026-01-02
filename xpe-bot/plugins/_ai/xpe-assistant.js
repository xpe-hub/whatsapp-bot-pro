/**
 * XPE Bot - Plugin de XPE Assistant
 * Integración con IA para chat y generación de código
 */

export default function aiPlugin(registerCommand) {
    // ========================================
    // Comando: ia
    // Chat con XPE Assistant
    // ========================================
    registerCommand(
        'ia',
        async (sock, message, args, fullArgs, bot) => {
            const chatJid = message.key.remoteJid;
            const senderJid = message.key.participant || message.key.remoteJid;
            const senderNumber = senderJid.replace(/@.*$/, '');

            // Verificar si hay mensaje
            if (!fullArgs.trim()) {
                await sock.sendMessage(chatJid, {
                    text: `╔══════════════════════════════════════╗
║        🤖 XPE ASSISTANT              ║
╚══════════════════════════════════════╝

✨ *Cómo usar:*

• !ia [pregunta] - Preguntar cualquier cosa
• !codigo [descripción] - Generar código
• !analizar [código] - Analizar código existente
• !traducir [texto] - Traducir texto

📝 *Ejemplo:*
!ia ¿Qué es un bot de WhatsApp?`,

                    contextInfo: {
                        mentionedJid: [senderJid]
                    }
                });
                return;
            }

            // Mostrar que está pensando
            await sock.sendMessage(chatJid, {
                react: { text: '🤔', key: message.key }
            });

            // Importar servicio de IA
            const { askXPE } = await import('../services/ai-service.js');

            try {
                const result = await askXPE(fullArgs, senderNumber);

                if (result.success) {
                    // Dividir mensaje si es muy largo
                    const response = `🤖 *XPE Assistant responde:*

${result.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✦ v${'1.0.0'} | XPE Bot`;

                    // Verificar longitud
                    if (response.length > 4000) {
                        // Enviar en partes
                        const parts = response.match(/.{1,3800}/g);
                        for (const part of parts) {
                            await sock.sendMessage(chatJid, {
                                text: part + (part !== parts[parts.length - 1] ? '...' : ''),
                                contextInfo: { mentionedJid: [senderJid] }
                            });
                            await new Promise(r => setTimeout(r, 500));
                        }
                    } else {
                        await sock.sendMessage(chatJid, {
                            text: response,
                            contextInfo: { mentionedJid: [senderJid] }
                        });
                    }
                } else {
                    await sock.sendMessage(chatJid, {
                        text: `⚠️ *Error:* ${result.message}`,
                        contextInfo: { mentionedJid: [senderJid] }
                    });
                }

            } catch (error) {
                await sock.sendMessage(chatJid, {
                    text: `❌ *Error:* No pude procesar tu solicitud. Intenta más tarde.`,
                    contextInfo: { mentionedJid: [senderJid] }
                });
            }
        },
        {
            description: 'Chatear con XPE Assistant (IA)',
            category: 'Inteligencia Artificial',
            usage: '!ia [tu pregunta]',
            aliases: ['ai', 'ask', 'chat']
        }
    );

    // ========================================
    // Comando: codigo
    // Generar código para el bot
    // ========================================
    registerCommand(
        'codigo',
        async (sock, message, args, fullArgs, bot) => {
            const chatJid = message.key.remoteJid;
            const senderJid = message.key.participant || message.key.remoteJid;

            if (!fullArgs.trim()) {
                await sock.sendMessage(chatJid, {
                    text: `╔══════════════════════════════════════╗
║       💻 GENERADOR DE CÓDIGO        ║
╚══════════════════════════════════════╝

✨ *Cómo usar:*

Describe qué código necesitas y XPE Assistant lo generará.

📝 *Ejemplos:*
• !codigo Crear un comando de ping
• !codigo Función para enviar stickers
• !codigo Plugin de bienvenida para grupos`,

                    contextInfo: { mentionedJid: [senderJid] }
                });
                return;
            }

            await sock.sendMessage(chatJid, {
                react: { text: '💻', key: message.key }
            });

            const { generateCode } = await import('../services/ai-service.js');

            try {
                const result = await generateCode(fullArgs, 'baileys');

                if (result.success) {
                    const response = `💻 *Código generado:*

${result.code}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✦ Copia y pega en un archivo .js`,

                    await sock.sendMessage(chatJid, {
                        text: response,
                        contextInfo: { mentionedJid: [senderJid] }
                    });
                } else {
                    await sock.sendMessage(chatJid, {
                        text: `⚠️ *Error:* ${result.message}`,
                        contextInfo: { mentionedJid: [senderJid] }
                    });
                }

            } catch (error) {
                await sock.sendMessage(chatJid, {
                    text: `❌ *Error:* No pude generar el código.`,
                    contextInfo: { mentionedJid: [senderJid] }
                });
            }
        },
        {
            description: 'Generar código para el bot',
            category: 'Inteligencia Artificial',
            usage: '!codigo [descripción del código]',
            aliases: ['code', 'generate']
        }
    );

    // ========================================
    // Comando: analizar
    // Analizar código existente
    // ========================================
    registerCommand(
        'analizar',
        async (sock, message, args, fullArgs, bot) => {
            const chatJid = message.key.remoteJid;
            const senderJid = message.key.participant || message.key.remoteJid;

            // Obtener código del mensaje o quote
            let codeToAnalyze = fullArgs.trim();

            // Si es un quote, intentar obtener el código citado
            if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quoted = message.message.extendedTextMessage.contextInfo.quotedMessage;
                codeToAnalyze = quoted.conversation ||
                    quoted.extendedTextMessage?.text ||
                    quoted.documentMessage?.caption || '';
            }

            if (!codeToAnalyze) {
                await sock.sendMessage(chatJid, {
                    text: `📊 *Analizador de Código*

使用方法:
• Responde a un mensaje con código y escribe !analizar
• O pega el código directamente: !analizar [código]`,

                    contextInfo: { mentionedJid: [senderJid] }
                });
                return;
            }

            await sock.sendMessage(chatJid, {
                react: { text: '📊', key: message.key }
            });

            const { analyzeCode } = await import('../services/ai-service.js');

            try {
                const result = await analyzeCode(codeToAnalyze);

                if (result.success) {
                    await sock.sendMessage(chatJid, {
                        text: `📊 *Análisis de Código:*

${result.analysis}`,
                        contextInfo: { mentionedJid: [senderJid] }
                    });
                } else {
                    await sock.sendMessage(chatJid, {
                        text: `⚠️ *Error:* ${result.message}`,
                        contextInfo: { mentionedJid: [senderJid] }
                    });
                }

            } catch (error) {
                await sock.sendMessage(chatJid, {
                    text: `❌ *Error:* No pude analizar el código.`,
                    contextInfo: { mentionedJid: [senderJid] }
                });
            }
        },
        {
            description: 'Analizar código existente',
            category: 'Inteligencia Artificial',
            usage: '!analizar [código] o responde a un código',
            aliases: ['analyze', 'review']
        }
    );

    // ========================================
    // Comando: traducir
    // Traducir texto usando IA
    // ========================================
    registerCommand(
        'traducir',
        async (sock, message, args, fullArgs, bot) => {
            const chatJid = message.key.remoteJid;
            const senderJid = message.key.participant || message.key.remoteJid;

            // Detectar idioma del args
            // Formato: !traducir en Hola mundo -> traduce al inglés
            const langMatch = fullArgs.match(/^(es|en|pt|fr|de|it|ja|ko|zh)\s+/i);

            let targetLang = 'es';
            let textToTranslate = fullArgs;

            if (langMatch) {
                targetLang = langMatch[1].toLowerCase();
                textToTranslate = fullArgs.slice(langMatch[0].length).trim();
            }

            if (!textToTranslate) {
                await sock.sendMessage(chatJid, {
                    text: `🌐 *Traductor XPE*

使用方法:
• !traducir en Hola mundo (traducir al inglés)
• !traducir pt Hola (traducir al portugués)
• !traducir es Hello (traducir al español)

Idiomas: es, en, pt, fr, de, it, ja, ko, zh`,

                    contextInfo: { mentionedJid: [senderJid] }
                });
                return;
            }

            await sock.sendMessage(chatJid, {
                react: { text: '🌐', key: message.key }
            });

            const { translateText } = await import('../services/ai-service.js');

            const langNames = {
                es: 'Español',
                en: 'Inglés',
                pt: 'Portugués',
                fr: 'Francés',
                de: 'Alemán',
                it: 'Italiano',
                ja: 'Japonés',
                ko: 'Coreano',
                zh: 'Chino'
            };

            try {
                const result = await translateText(textToTranslate, targetLang);

                if (result.success) {
                    const response = `🌐 *Traducción* (${langNames[targetLang] || targetLang}):

"${result.translation}"`;

                    await sock.sendMessage(chatJid, {
                        text: response,
                        contextInfo: { mentionedJid: [senderJid] }
                    });
                } else {
                    await sock.sendMessage(chatJid, {
                        text: `⚠️ *Error:* ${result.message}`,
                        contextInfo: { mentionedJid: [senderJid] }
                    });
                }

            } catch (error) {
                await sock.sendMessage(chatJid, {
                    text: `❌ *Error:* No pude traducir el texto.`,
                    contextInfo: { mentionedJid: [senderJid] }
                });
            }
        },
        {
            description: 'Traducir texto a cualquier idioma',
            category: 'Inteligencia Artificial',
            usage: '!traducir [idioma] [texto]',
            aliases: ['translate', 'trad']
        }
    );
}
