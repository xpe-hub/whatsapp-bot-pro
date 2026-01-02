/**
 * XPE Bot - Configuración del Sistema
 * Carga variables de entorno y proporciona valores por defecto
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// Cargar archivo .env si existe
// ============================================
const envPath = join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

// ============================================
// Configuración del Sistema
// ============================================
const CONFIG = {
    // ========================================
    // Owner y Permisos
    // ========================================
    ownerNumber: process.env.XPE_OWNER_NUMBER || '',
    commandPrefix: process.env.XPE_COMMAND_PREFIX || '!',

    // ========================================
    // OpenAI / IA
    // ========================================
    openaiKey: process.env.OPENAI_API_KEY || '',
    aiModel: process.env.AI_MODEL || 'gpt-4o',

    // ========================================
    // Panel Web
    // ========================================
    panelPort: parseInt(process.env.PANEL_PORT) || 3000,
    panelAuthToken: process.env.PANEL_AUTH_TOKEN || 'xpe-default-token-change-me',

    // ========================================
    // Grupo de Owners
    // ========================================
    ownerGroupId: process.env.OWNER_GROUP_ID || '',
    notifyOnStart: process.env.NOTIFY_ON_START === 'true',
    notifyOnUpdates: process.env.NOTIFY_ON_UPDATES === 'true',
    updateCheckInterval: parseInt(process.env.UPDATE_CHECK_INTERVAL) || 30,

    // ========================================
    // Conexión WhatsApp
    // ========================================
    connectionType: process.env.CONNECTION_TYPE || 'single',
    maxReconnectAttempts: parseInt(process.env.MAX_RECONNECT_ATTEMPTS) || 5,
    reconnectInterval: parseInt(process.env.RECONNECT_INTERVAL) || 5000,

    // ========================================
    // Logs
    // ========================================
    logLevel: process.env.LOG_LEVEL || 'info',
    saveLogsToFile: process.env.SAVE_LOGS_TO_FILE === 'true',

    // ========================================
    // MongoDB (Opcional)
    // ========================================
    mongodbUri: process.env.MONGODB_URI || '',

    // ========================================
    // Rutas
    // ========================================
    sessionsDir: join(__dirname, '..', 'sessions'),
    logsDir: join(__dirname, '..', 'logs'),
    pluginsDir: join(__dirname, '..', 'plugins'),
    webDir: join(__dirname, '..', 'web')
};

// ============================================
// Validador de Configuración
// ============================================
export function validateConfig() {
    const errors = [];

    if (!CONFIG.ownerNumber) {
        errors.push('⚠️  XPE_OWNER_NUMBER no está configurado');
    }

    if (!CONFIG.openaiKey) {
        errors.push('⚠️  OPENAI_API_KEY no está configurado (algunas funciones de IA no funcionarán)');
    }

    if (CONFIG.panelAuthToken === 'xpe-default-token-change-me') {
        errors.push('⚠️  PANEL_AUTH_TOKEN usa el valor por defecto. Cámbialo en producción!');
    }

    // Crear directorios si no existen
    [CONFIG.sessionsDir, CONFIG.logsDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        config: CONFIG
    };
}

// ============================================
// Getters Tipados
// ========================================
export function getOwnerNumber() {
    return CONFIG.ownerNumber.replace(/[^0-9]/g, '');
}

export function getJid(number) {
    const clean = number.replace(/[^0-9]/g, '');
    return `${clean}@s.whatsapp.net`;
}

export function getGroupJid(id) {
    return `${id}@g.us`;
}

export function isOwner(jid) {
    const ownerJid = getJid(CONFIG.ownerNumber);
    return jid === ownerJid || jid === `${ownerJid.split('@')[0]}@s.whatsapp.net`;
}

// ============================================
// Exportar Configuración
// ============================================
export default CONFIG;
