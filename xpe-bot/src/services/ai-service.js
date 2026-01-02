/**
 * XPE Bot - Servicio de IA (XPE Assistant)
 * Integración con OpenAI para respuestas inteligentes
 */

import OpenAI from 'openai';
import CONFIG from '../config/settings.js';
import BRANDING from '../config/branding.js';
import logger from '../lib/logger.js';
import NodeCache from 'node-cache';

const openai = new OpenAI({
    apiKey: CONFIG.openaiKey
});

// Cache de conversaciones (para mantener contexto)
const conversationCache = new NodeCache({ stdTTL: 3600 }); // 1 hora

// ============================================
// Utilidades
// ============================================

/**
 * Obtener historial de conversación
 */
function getConversationHistory(userId) {
    return conversationCache.get(userId) || [];
}

/**
 * Guardar mensaje en historial
 */
function saveToHistory(userId, role, content) {
    const history = getConversationHistory(userId);
    history.push({ role, content });

    // Mantener máximo 20 mensajes
    if (history.length > 20) {
        history.shift();
    }

    conversationCache.set(userId, history);
}

/**
 * Limpiar historial de conversación
 */
function clearConversation(userId) {
    conversationCache.del(userId);
}

/**
 * Formatear historial para OpenAI
 */
function formatHistoryForAPI(history) {
    return [
        { role: 'system', content: BRANDING.aiPersona },
        ...history.slice(-10) // Últimos 10 mensajes
    ];
}

// ============================================
// Funciones Principales
// ============================================

/**
 * Responder como XPE Assistant
 */
export async function askXPE(prompt, userId, context = '') {
    try {
        // Validar API key
        if (!CONFIG.openaiKey) {
            return {
                success: false,
                error: 'API key de OpenAI no configurada',
                message: '⚠️ *XPE Assistant no disponible:* Falta la clave de API.'
            };
        }

        // Agregar contexto si existe
        if (context) {
            saveToHistory(userId, 'user', `[Contexto: ${context}] ${prompt}`);
        } else {
            saveToHistory(userId, 'user', prompt);
        }

        // Obtener historial
        const history = formatHistoryForAPI(getConversationHistory(userId));

        // Hacer petición a OpenAI
        const response = await openai.chat.completions.create({
            model: CONFIG.aiModel,
            messages: history,
            temperature: 0.7,
            max_tokens: 2000,
            presence_penalty: 0.6,
            frequency_penalty: 0.3
        });

        const answer = response.choices[0].message.content;

        // Guardar respuesta
        saveToHistory(userId, 'assistant', answer);

        logger.ai('Respuesta generada', { userId, tokens: response.usage.total_tokens });

        return {
            success: true,
            message: answer,
            usage: response.usage
        };

    } catch (error) {
        logger.ai('Error generando respuesta', { error: error.message });

        return {
            success: false,
            error: error.message,
            message: '⚠️ *XPE Assistant ocupado:* No pude procesar tu solicitud. Intenta más tarde.'
        };
    }
}

/**
 * Generar código para el bot
 */
export async function generateCode(request, library = 'baileys') {
    try {
        const codePrompt = `Eres un desarrollador experto en bots de WhatsApp usando ${library}.

Genera código completo y funcional para la siguiente solicitud:
"${request}"

REGLAS:
1. Genera código limpio, bien comentado y listo para usar
2. Usa sintaxis moderna de JavaScript (ES6+)
3. Incluye manejo de errores
4. Si es un plugin de XPE Bot, usa el formato correcto
5. Explica brevemente cómo usar el código

Responde solo con el código y una breve explicación.`;

        const response = await openai.chat.completions.create({
            model: CONFIG.aiModel,
            messages: [
                { role: 'system', content: codePrompt },
                { role: 'user', content: request }
            ],
            temperature: 0.3,
            max_tokens: 3000
        });

        return {
            success: true,
            code: response.choices[0].message.content
        };

    } catch (error) {
        logger.ai('Error generando código', { error: error.message });
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Analizar código
 */
export async function analyzeCode(code) {
    try {
        const analysisPrompt = `Analiza el siguiente código de bot de WhatsApp:

\`\`\`javascript
${code}
\`\`\`

Proporciona:
1. 📊 RESUMEN: ¿Qué hace este código?
2. ✅ FORTALEZAS: Puntos positivos
3. ⚠️ PROBLEMAS: Errores o mejoras posibles
4. 🔧 OPTIMIZACIONES: Sugerencias específicas
5. 🔒 SEGURIDAD: Revisa vulnerabilidades
6. 💡 MEJORAS: Ideas para expandir

Sé específico y profesional.`;

        const response = await openai.chat.completions.create({
            model: CONFIG.aiModel,
            messages: [
                { role: 'system', content: 'Eres un experto en análisis de código de bots de WhatsApp.' },
                { role: 'user', content: analysisPrompt }
            ],
            temperature: 0.4,
            max_tokens: 2000
        });

        return {
            success: true,
            analysis: response.choices[0].message.content
        };

    } catch (error) {
        logger.ai('Error analizando código', { error: error.message });
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Sugerir comando
 */
export async function suggestCommand(commandName, library = 'baileys') {
    try {
        const suggestPrompt = `Crea un comando completo para un bot de WhatsApp usando ${library}.

NOMBRE: ${commandName}

INCLUYE:
1. ✅ Código completo del comando
2. 📝 Descripción de qué hace
3. 🔧 Uso (ej: !${commandName})
4. 📋 Args requeridos/opcionales
5. 💬 Respuestas de ejemplo
6. 🔒 Permisos necesarios
7. 📦 Dependencias externas

Genera TODO el código necesario, listo para usar en XPE Bot.`;

        const response = await openai.chat.completions.create({
            model: CONFIG.aiModel,
            messages: [
                { role: 'system', content: 'Eres un experto en crear comandos para bots de WhatsApp.' },
                { role: 'user', content: suggestPrompt }
            ],
            temperature: 0.5,
            max_tokens: 3000
        });

        return {
            success: true,
            suggestion: response.choices[0].message.content
        };

    } catch (error) {
        logger.ai('Error sugiriendo comando', { error: error.message });
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Traducir texto
 */
export async function translateText(text, targetLang = 'es') {
    try {
        const translatePrompt = `Traduce el siguiente texto al ${targetLang}:

"${text}"

Solo responde con la traducción, sin explicaciones.`;

        const response = await openai.chat.completions.create({
            model: CONFIG.aiModel,
            messages: [
                { role: 'user', content: translatePrompt }
            ],
            temperature: 0.3,
            max_tokens: 1000
        });

        return {
            success: true,
            translation: response.choices[0].message.content
        };

    } catch (error) {
        logger.ai('Error traduciendo', { error: error.message });
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================
// Exports
// ============================================
export default {
    askXPE,
    generateCode,
    analyzeCode,
    suggestCommand,
    translateText,
    getConversationHistory,
    clearConversation
};
