/**
 * XPE Bot - Cargador de Plugins
 * Carga dinámicamente todos los plugins del directorio
 */

import { readdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { registerCommand } from './handler.js';
import logger from '../lib/logger.js';
import CONFIG from '../config/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// Categorías de Plugins
// ============================================
const CATEGORIES = {
    admin: 'Administración',
    ai: 'Inteligencia Artificial',
    owner: 'Dueño del Bot',
    utils: 'Utilidades',
    media: 'Multimedia',
    entertainment: 'Entretenimiento',
    downloads: 'Descargas'
};

// ============================================
// Cargar plugins de una categoría
// ============================================
async function loadCategoryPlugins(category) {
    const categoryPath = path.join(CONFIG.pluginsDir, `_${category}`);

    if (!existsSync(categoryPath)) {
        logger.debug(`Carpeta de plugins no encontrada: ${categoryPath}`);
        return 0;
    }

    try {
        const files = readdirSync(categoryPath).filter(
            f => f.endsWith('.js') && !f.startsWith('_')
        );

        let loadedCount = 0;

        for (const file of files) {
            try {
                const filePath = path.join(categoryPath, file);
                const module = await import(`file://${filePath}`);

                if (module.default && typeof module.default === 'function') {
                    // El plugin exporta una función que registra comandos
                    module.default(registerCommand);
                    loadedCount++;
                    logger.info(`Plugin cargado: ${file}`);
                } else if (module.default && module.default.commands) {
                    // El plugin tiene comandos pre-registrados
                    module.default.commands.forEach(cmd => {
                        registerCommand(cmd.name, cmd.handler, cmd.options);
                    });
                    loadedCount++;
                    logger.info(`Plugin cargado: ${file}`);
                }
            } catch (error) {
                logger.warn(`Error cargando plugin ${file}: ${error.message}`);
            }
        }

        return loadedCount;
    } catch (error) {
        logger.warn(`Error leyendo carpeta ${category}: ${error.message}`);
        return 0;
    }
}

/**
 * Cargar todos los plugins
 */
export async function loadPlugins() {
    console.log(`
╔══════════════════════════════════════════╗
║     XPE Bot - Cargando Plugins           ║
╚══════════════════════════════════════════╝
    `);

    const startTime = Date.now();
    let totalPlugins = 0;

    // Cargar plugins de cada categoría
    for (const [category] of Object.entries(CATEGORIES)) {
        const count = await loadCategoryPlugins(category);
        totalPlugins += count;
    }

    const duration = Date.now() - startTime;

    console.log(`
╔══════════════════════════════════════════╗
║     ✅ Plugins Cargados                  ║
╚══════════════════════════════════════════╝

📦 Total de plugins: ${totalPlugins}
⏱️ Tiempo: ${duration}ms
    `);

    // Mostrar resumen de categorías
    console.log('📁 Plugins por categoría:');
    for (const [category, name] of Object.entries(CATEGORIES)) {
        const categoryPath = path.join(CONFIG.pluginsDir, `_${category}`);
        if (existsSync(categoryPath)) {
            const count = readdirSync(categoryPath).filter(
                f => f.endsWith('.js') && !f.startsWith('_')
            ).length;
            if (count > 0) {
                console.log(`   • ${name}: ${count}`);
            }
        }
    }
    console.log('');
}

/**
 * Recargar un plugin específico
 */
export async function reloadPlugin(pluginPath) {
    try {
        // Limpiar comandos del plugin
        // Nota: Esta funcionalidad requeriría más implementación

        // Recargar el archivo
        const module = await import(`file://${pluginPath}`);

        if (module.default && typeof module.default === 'function') {
            module.default(registerCommand);
            return { success: true };
        }

        return { success: false, error: 'Formato de plugin inválido' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Obtener lista de plugins cargados
 */
export function getLoadedPlugins() {
    const plugins = [];

    for (const [category] of Object.entries(CATEGORIES)) {
        const categoryPath = path.join(CONFIG.pluginsDir, `_${category}`);

        if (existsSync(categoryPath)) {
            const files = readdirSync(categoryPath).filter(
                f => f.endsWith('.js') && !f.startsWith('_')
            );

            files.forEach(file => {
                plugins.push({
                    name: file.replace('.js', ''),
                    category: CATEGORIES[category] || category,
                    path: path.join(categoryPath, file)
                });
            });
        }
    }

    return plugins;
}

/**
 * Estructura de ejemplo de un plugin
 */
export function getPluginTemplate(category) {
    const templates = {
        admin: `/**
 * Plugin de Administración
 * Categoría: ${CATEGORIES.admin}
 */

export default function adminPlugin(registerCommand) {
    registerCommand(
        'kick',
        async (sock, message, args, fullArgs, bot) => {
            // Tu código aquí
        },
        {
            description: 'Expulsar a un usuario del grupo',
            category: '${CATEGORIES.admin}',
            usage: '${CONFIG.commandPrefix}kick @usuario',
            adminOnly: true,
            groupOnly: true
        }
    );
}`,
        ai: `/**
 * Plugin de IA
 * Categoría: ${CATEGORIES.ai}
 */

export default function aiPlugin(registerCommand) {
    registerCommand(
        'ia',
        async (sock, message, args, fullArgs, bot) => {
            // Tu código aquí
        },
        {
            description: 'Preguntar a la IA',
            category: '${CATEGORIES.ai}',
            usage: '${CONFIG.commandPrefix}ia ¿Qué es XPE Bot?'
        }
    );
}`,
        owner: `/**
 * Plugin de Owner
 * Categoría: ${CATEGORIES.owner}
 */

export default function ownerPlugin(registerCommand) {
    registerCommand(
        'restart',
        async (sock, message, args, fullArgs, bot) => {
            // Tu código aquí
        },
        {
            description: 'Reiniciar el bot',
            category: '${CATEGORIES.owner}',
            usage: '${CONFIG.commandPrefix}restart',
            ownerOnly: true
        }
    );
}`,
        utils: `/**
 * Plugin de Utilidades
 * Categoría: ${CATEGORIES.utils}
 */

export default function utilsPlugin(registerCommand) {
    registerCommand(
        'ping',
        async (sock, message, args, fullArgs, bot) => {
            // Tu código aquí
        },
        {
            description: 'Verificar si el bot está activo',
            category: '${CATEGORIES.utils}',
            usage: '${CONFIG.commandPrefix}ping'
        }
    );
}`,
        media: `/**
 * Plugin de Multimedia
 * Categoría: ${CATEGORIES.media}
 */

export default function mediaPlugin(registerCommand) {
    registerCommand(
        'sticker',
        async (sock, message, args, fullArgs, bot) => {
            // Tu código aquí
        },
        {
            description: 'Crear un sticker de imagen',
            category: '${CATEGORIES.media}',
            usage: '${CONFIG.commandPrefix}sticker'
        }
    );
}`
    };

    return templates[category] || templates.utils;
}

export default {
    loadPlugins,
    reloadPlugin,
    getLoadedPlugins,
    getPluginTemplate,
    CATEGORIES
};
