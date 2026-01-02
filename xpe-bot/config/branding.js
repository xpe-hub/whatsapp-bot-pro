/**
 * XPE Bot - Configuración de Identidad y Personalidad
 * Este archivo define toda la identidad del bot
 * ¡Todo el branding está centralizado aquí!
 */

export const BRANDING = {
    // ========================================
    // Información del Bot
    // ========================================
    botName: 'XPE Bot',
    version: '1.0.0',
    codeName: 'XPE-X',
    author: 'XPE Development Team',
    website: 'https://xpe-systems.github.io/xpe-bot',
    github: 'https://github.com/xpe-systems/xpe-bot',
    support: 'https://wa.me/5491112345678',

    // ========================================
    // Colores de la Identidad Visual
    // ========================================
    colors: {
        primary: '#00D4FF',      // Cyan Neon
        secondary: '#1A1A2E',    // Dark Blue
        accent: '#7B2CBF',       // Purple
        success: '#00FF94',      // Green
        warning: '#FFD700',      // Gold
        danger: '#FF4757',       // Red
        info: '#54A0FF'          // Light Blue
    },

    // ========================================
    // Mensajes del Sistema
    // ========================================
    messages: {
        // Estados
        wait: '🔄 *XPE Processing...* Un momento por favor.',
        loading: '⏳ *XPE cargando recursos...*',
        thinking: '🤔 *XPE pensando...*',

        // Respuestas
        success: '✅ *XPE Success:* Operación completada correctamente.',
        error: '❌ *XPE Error:* Ha ocurrido un error. Intenta nuevamente.',
        timeout: '⏱️ *XPE Timeout:* La operación tardó demasiado.',

        // Permisos
        ownerOnly: '🛡️ *XPE Security:* Este comando es exclusivo para el owner.',
        adminOnly: '🛡️ *XPE Security:* Este comando requiere ser administrador del grupo.',
        privateOnly: '🔒 *XPE Security:* Usa este comando en privado con el bot.',

        // Información
        help: '📖 *XPE Help:* Usa {prefix}menu para ver todos los comandos.',
        notFound: '🔍 *XPE Not Found:* No encontré lo que buscas.',
        comingSoon: '🚧 *XPE Coming Soon:* Esta función está en desarrollo.'
    },

    // ========================================
    // Formato de Mensajes
    // ========================================
    format: {
        commandPrefix: '!',
        mentionFormat: '@{number}',
        timeZone: 'America/Argentina/Buenos_Aires',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss'
    },

    // ========================================
    // XPE Assistant - Personalidad de la IA
    // ========================================
    aiPersona: `Eres XPE Assistant, una inteligencia artificial avanzada desarrollada por XPE Systems.

TU MISIÓN:
- Asistir a usuarios con consultas sobre WhatsApp, programación y automatización
- Generar código limpio, funcional y bien comentado
- Explicar conceptos técnicos de forma clara y accesible

TU ESTILO:
- Profesional pero amigable
- Conciso pero completo
- Usa emojis sparingly para mejorar la legibilidad
- Siempre proporciona contexto y explicaciones

EXPERTISE:
- Bots de WhatsApp (Baileys, whatsapp-web.js)
- JavaScript/Node.js
- APIs REST y Webhooks
- Base de datos (MongoDB, NeDB)
- Deployment y servidores (Linux, Termux, Windows)

REGLAS:
1. Si no sabes algo, sé honesto
2. Proporciona ejemplos prácticos
3. Advierte sobre limitaciones y mejores prácticas
4. Mantén el código seguro y sin vulnerabilidades`,

    // ========================================
    // Plantillas de Mensajes Automáticos
    // ========================================
    templates: {
        welcome: `🎉 *¡Bienvenido/a a {groupName}!* 🎉\n\nGracias por unirte a nuestra comunidad.\n\n📋 *Recuerda:*\n- Lee las reglas del grupo\n- Respeta a todos los miembros\n- ¡Diviértete!\n\n{footer}`,

        goodbye: `👋 *¡Adiós {name}!* 👋\n\nGracias por haber estado con nosotros.\n¡Te echaremos de menos!\n\n{footer}`,

        updateNotification: `╔══════════════════════════════════════╗\n║     ⚠️  XPE SYSTEM ALERT  ⚠️         ║\n╚══════════════════════════════════════╝\n\n🔄 *Nueva actualización disponible*\n📊 *Commits pendientes:* {count}\n\n📝 *Cambios recientes:*\n{commits}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🛠️ Para actualizar ejecuta:\n• {prefix}update\n• O visita el Panel de Control\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n{footer}`,

        botStarted: `╔══════════════════════════════════════╗\n║      ✅ XPE BOT INICIADO              ║\n╚══════════════════════════════════════╝\n\nEl sistema está operativo y listo para recibir comandos.\n\n🌐 *Panel de Control:* {panelUrl}\n📖 *Ayuda:* {prefix}menu\n\n{footer}`
    },

    // ========================================
    // Footer Estándar para Mensajes
    // ========================================
    footer: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✦ Enviado desde *XPE Bot* | v{version}\n✦ {website}',

    // ========================================
    // Configuración de Grupos
    // ========================================
    groups: {
        welcomeEnabled: true,
        goodbyeEnabled: true,
        antiLink: false,
        antiSpam: true,
        autoDelete: 0 // segundos, 0 para desactivar
    }
};

// ========================================
// Helper Functions para Branding
// ========================================

export function getBrandMessage(key, replacements = {}) {
    let message = BRANDING.messages[key] || BRANDING.messages.notFound;

    // Reemplazar variables
    Object.keys(replacements).forEach(param => {
        message = message.replace(new RegExp(`{${param}}`, 'g'), replacements[param]);
    });

    return message;
}

export function formatFooter() {
    return BRANDING.footer
        .replace('{version}', BRANDING.version)
        .replace('{website}', BRANDING.website);
}

export function getWelcomeMessage(groupName) {
    return BRANDING.templates.welcome
        .replace('{groupName}', groupName)
        .replace('{footer}', formatFooter());
}

export function getGoodbyeMessage(name) {
    return BRANDING.templates.goodbye
        .replace('{name}', name)
        .replace('{footer}', formatFooter());
}

export function getBotStartedMessage(panelUrl, prefix) {
    return BRANDING.templates.botStarted
        .replace('{panelUrl}', panelUrl)
        .replace('{prefix}', prefix)
        .replace('{footer}', formatFooter());
}

export default BRANDING;
