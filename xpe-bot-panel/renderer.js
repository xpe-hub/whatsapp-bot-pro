// XPE-BOT Panel - Lógica de la Interfaz

// Estados del idioma
const LANGUAGES = {
    ES: { code: 'ES', flag: '🇪🇸', name: 'Español', label: 'Spanish' },
    EN: { code: 'EN', flag: '🇺🇸', name: 'English', label: 'English' },
    BILINGUAL: { code: 'BILINGUAL', flag: '🌐', name: 'Bilingüe', label: 'Bilingual' }
};

let appState = {
    currentUser: null,
    language: 'ES',
    stats: { totalMessages: 0, totalCommands: 0, totalUsers: 0 },
    botPath: '',
    botLibrary: 'whatsapp-web.js',
    currentFile: null,
    fileTree: null,
    editorContent: '',
    modifiedContent: '',
    aiChatHistory: []
};

// Elementos
const elements = {
    loginScreen: null,
    mainContent: null,
    usernameInput: null,
    notification: null,
    fileExplorer: null,
    codeEditor: null,
    aiPrompt: null,
    aiResponse: null,
    languageBtn: null,
    languageMenu: null
};

// Prompts del sistema para XPE Assistant
const AI_SYSTEM_PROMPTS = {
    ES: `Eres XPE Assistant, un EXPERTO ESPECIALIZADO en bots de WhatsApp.

TU MISIÓN:
- Ayudar a crear, mejorar y depurar bots de WhatsApp
- Generar código específico y funcional
- Explicar conceptos de forma clara y educativa

EXPERTISE:
1. LIBRERÍAS: whatsapp-web.js (WWebJS), @whiskeysockets/baileys
2. COMANDOS: Prefijos (! . /), argumentos, menciones
3. RESPUESTAS AUTOMÁTICAS: keywords, regex, menciones
4. MODERACIÓN: ban, kick, mute, promote
5. GRUPOS: bienvenida, despedidas, reglas
6. MULTIMEDIA: stickers, imágenes, videos, notas de voz
7. APIs EXTERNAS: clima, crypto, noticias, APIs REST
8. ECONOMÍA: coins, XP, niveles, tienda
9. JUEGOS: trivia, ahorcado, dados, casino
10. BASE DE DATOS: JSON, SQLite, MongoDB

REGLAS DE CÓDIGO:
- SIEMPRE usa sintaxis correcta para la librería detectada
- Incluye manejo de errores (try/catch)
- Comenta código importante
- Evita código deprecated
- Usa async/await correctamente

ESTILO:
- Profesional pero amigable
- Explica "por qué" no solo "qué"
- Sugiere mejores prácticas
- Advierte sobre limitaciones de la librería

Cuandoigues generar código, SIEMPRE:
1. Pregunta qué librería usa si no está claro
2. Verifica contexto del bot antes de sugerir
3. Prueba mentalmente el código antes de devolver
4. Incluye ejemplos de uso`,

    EN: `You are XPE Assistant, a SPECIALIZED EXPERT in WhatsApp bots.

YOUR MISSION:
- Help create, improve and debug WhatsApp bots
- Generate specific and functional code
- Explain concepts clearly and educationally

EXPERTISE:
1. LIBRARIES: whatsapp-web.js (WWebJS), @whiskeysockets/baileys
2. COMMANDS: Prefixes (! . /), arguments, mentions
3. AUTO-REPLIES: keywords, regex, mentions
4. MODERATION: ban, kick, mute, promote
5. GROUPS: welcome, goodbye, rules
6. MULTIMEDIA: stickers, images, videos, voice notes
7. EXTERNAL APIs: weather, crypto, news, REST APIs
8. ECONOMY: coins, XP, levels, shop
9. GAMES: trivia, hangman, dice, casino
10. DATABASE: JSON, SQLite, MongoDB

CODE RULES:
- ALWAYS use correct syntax for the detected library
- Include error handling (try/catch)
- Comment important code
- Avoid deprecated code
- Use async/await correctly

STYLE:
- Professional but friendly
- Explain "why" not just "what"
- Suggest best practices
- Warn about library limitations

When generating code, ALWAYS:
1. Ask which library if unclear
2. Check bot context before suggesting
3. Mentally test code before returning
4. Include usage examples`,

    BILINGUAL: `You are XPE Assistant, a SPECIALIZED EXPERT in WhatsApp bots.

YOUR MISSION:
- Help create, improve and debug WhatsApp bots
- Generate specific and functional code
- Explain concepts clearly with Spanish explanations

LIBRARIES: whatsapp-web.js (WWebJS), @whiskeysockets/baileys

CODE RULES:
- ALWAYS use correct syntax for the detected library
- Include error handling (try/catch)
- Comment important code in Spanish/English
- Avoid deprecated code

RESPONSE STYLE:
- Code in English
- Explanations in Spanish (or bilingual when helpful)
- Professional but friendly
- Explain "why" not just "what"

IMPORTANT: When asked in Spanish, respond in Spanish but keep code and technical terms in English.`
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Panel] XPE-BOT Panel iniciado');

    // Cache elementos
    elements.loginScreen = document.getElementById('loginScreen');
    elements.mainContent = document.getElementById('mainContent');
    elements.usernameInput = document.getElementById('usernameInput');
    elements.notification = document.getElementById('notification');
    elements.fileExplorer = document.getElementById('fileExplorer');
    elements.codeEditor = document.getElementById('codeEditor');
    elements.aiPrompt = document.getElementById('aiPrompt');
    elements.aiResponse = document.getElementById('aiResponse');

    // Enter en nombre de usuario
    if (elements.usernameInput) {
        elements.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }

    // Verificar usuario guardado - simplificado para evitar problemas
    // await checkSavedUser();
    
    // Mostrar directamente la interfaz
    showMainInterface();

    // Cargar ruta guardada del bot
    await loadSavedBotPath();

    // Cargar clave de API
    await loadApiKey();

    // Configurar editor de texto
    setupTextEditor();

    // Escuchar cuando se configure la ruta del bot
    window.electronAPI.onBotPathConfigured((botPath) => {
        if (botPath) {
            appState.botPath = botPath;
            const botPathInput = document.getElementById('botPath');
            const botsViewPath = document.getElementById('botsViewPath');
            if (botPathInput) botPathInput.value = botPath;
            if (botsViewPath) botsViewPath.value = botPath;
            showNotification('Ruta del bot configurada', 'success');
            addLogToBox(`Ruta: ${botPath}`, 'info');
        }
    });

    // Obtener versión
    const version = await window.electronAPI.getAppVersion();
    console.log('[Panel] Version:', version);

    // Inicializar sistema de idiomas
    initLanguageSystem();

    // Detectar librería del bot
    detectBotLibrary();
});

async function checkSavedUser() {
    try {
        const result = await window.electronAPI.getCurrentUser();
        if (result.user) {
            appState.currentUser = result.user;
            showNotification('¡Bienvenido de nuevo, ' + result.user.username + '!', 'success');
            showMainInterface();
        }
    } catch (error) {
        console.error('[Panel] Error usuario:', error);
    }
}

async function login() {
    const username = elements.usernameInput?.value.trim();

    if (!username) {
        showNotification('Ingresa tu nombre de usuario', 'warning');
        return;
    }

    try {
        const result = await window.electronAPI.loginUser(username);

        if (result.success) {
            appState.currentUser = result.user;
            showNotification(result.message, 'success');
            showMainInterface();
        } else {
            // Si falla el login, igual entramos
            console.log('[Panel] Login failed but entering anyway:', result.error);
            appState.currentUser = { username: username };
            showNotification('¡Bienvenido, ' + username + '!', 'success');
            showMainInterface();
        }
    } catch (error) {
        console.error('[Panel] Error login:', error);
        // Entramos igual aunque falle
        appState.currentUser = { username: username };
        showNotification('¡Bienvenido, ' + username + '!', 'success');
        showMainInterface();
    }
}

function showMainInterface() {
    if (elements.loginScreen) elements.loginScreen.style.display = 'none';
    if (elements.mainContent) elements.mainContent.style.display = 'flex';
    loadDashboardData();
}

async function loadDashboardData() {
    try {
        const stats = await window.electronAPI.statsGet();
        appState.stats = stats;

        document.getElementById('statMessages')?.textContent = stats.totalMessages || 0;
        document.getElementById('statCommands')?.textContent = stats.totalCommands || 0;
        document.getElementById('statUsers')?.textContent = stats.totalUsers || 0;
        document.getElementById('statUptime')?.textContent = formatUptime(stats.uptime || 0);
    } catch (error) {
        console.error('[Panel] Error stats:', error);
    }
}

function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

// ========== SISTEMA DE IDIOMAS ==========

function initLanguageSystem() {
    // Cargar idioma guardado o usar español por defecto
    const savedLang = localStorage.getItem('xpe_language') || 'ES';
    appState.language = savedLang;
    
    // Crear botón flotante de idiomas si no existe
    createLanguageButton();
    
    // Actualizar UI
    updateLanguageUI();
    
    console.log('[Panel] Idioma cargado:', appState.language);
}

function createLanguageButton() {
    // Verificar si ya existe
    if (document.getElementById('language-fab')) return;
    
    // Crear el botón flotante
    const fab = document.createElement('div');
    fab.id = 'language-fab';
    fab.className = 'language-fab';
    fab.innerHTML = `
        <div class="lang-current" id="langCurrent">${LANGUAGES[appState.language].flag}</div>
        <div class="lang-options" id="langOptions" style="display: none;">
            ${Object.values(LANGUAGES).map(lang => `
                <div class="lang-option" data-lang="${lang.code}" title="${lang.label}">
                    ${lang.flag}
                </div>
            `).join('')}
        </div>
    `;
    
    // Estilos del botón
    fab.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
    `;
    
    const currentLang = fab.querySelector('.lang-current');
    currentLang.style.cssText = `
        width: 56px;
        height: 56px;
        background: var(--bg-tertiary, #1A1A1F);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
    `;
    
    const options = fab.querySelector('.lang-options');
    options.querySelectorAll('.lang-option').forEach(opt => {
        opt.style.cssText = `
            width: 44px;
            height: 44px;
            background: var(--bg-tertiary, #1A1A1F);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            cursor: pointer;
            transition: all 0.2s ease;
            opacity: 0;
            transform: translateY(10px);
        `;
        opt.onmouseover = () => opt.style.background = 'rgba(255, 255, 255, 0.1)';
        opt.onmouseout = () => opt.style.background = 'var(--bg-tertiary, #1A1A1F)';
    });
    
    // Evento click para mostrar/ocultar opciones
    currentLang.onclick = (e) => {
        e.stopPropagation();
        const isVisible = options.style.display !== 'none';
        options.style.display = isVisible ? 'none' : 'flex';
        
        if (!isVisible) {
            // Mostrar con animación
            const opts = options.querySelectorAll('.lang-option');
            opts.forEach((opt, i) => {
                setTimeout(() => {
                    opt.style.opacity = '1';
                    opt.style.transform = 'translateY(0)';
                }, i * 50);
            });
        }
    };
    
    // Evento click en opciones
    options.querySelectorAll('.lang-option').forEach(opt => {
        opt.onclick = (e) => {
            e.stopPropagation();
            const langCode = opt.dataset.lang;
            changeLanguage(langCode);
            options.style.display = 'none';
        };
    });
    
    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!fab.contains(e.target)) {
            options.style.display = 'none';
        }
    });
    
    document.body.appendChild(fab);
}

function changeLanguage(newLang) {
    if (!LANGUAGES[newLang]) return;
    
    const oldLang = appState.language;
    appState.language = newLang;
    localStorage.setItem('xpe_language', newLang);
    
    // Actualizar UI
    updateLanguageUI();
    
    // Notificar cambio
    const langInfo = LANGUAGES[newLang];
    showNotification(`Idioma: ${langInfo.flag} ${langInfo.name}`, 'success');
    
    console.log('[Panel] Idioma cambiado:', oldLang, '->', newLang);
}

function updateLanguageUI() {
    const currentBtn = document.getElementById('langCurrent');
    if (currentBtn) {
        currentBtn.textContent = LANGUAGES[appState.language].flag;
    }
    
    // Actualizar título del assistant si existe
    const aiInfo = document.querySelector('.ai-info span');
    if (aiInfo) {
        if (appState.language === 'ES') {
            aiInfo.textContent = 'Tu Asistente WhatsApp';
        } else if (appState.language === 'EN') {
            aiInfo.textContent = 'Your WhatsApp Assistant';
        } else {
            aiInfo.textContent = 'Your WhatsApp Companion';
        }
    }
}

function getLanguagePrompt() {
    return AI_SYSTEM_PROMPTS[appState.language] || AI_SYSTEM_PROMPTS['ES'];
}

// ========== DETECCIÓN DE LIBRERÍA DEL BOT ==========

async function detectBotLibrary() {
    try {
        const packagePath = appState.botPath ? `${appState.botPath}/package.json` : null;
        if (!packagePath) return;
        
        const result = await window.electronAPI.readFile(packagePath);
        if (result.success && result.content) {
            const packageJson = JSON.parse(result.content);
            
            if (packageJson.dependencies) {
                const deps = Object.keys(packageJson.dependencies).join(' ');
                
                if (deps.includes('whatsapp-web.js')) {
                    appState.botLibrary = 'whatsapp-web.js';
                    console.log('[Panel] Librería detectada: whatsapp-web.js');
                } else if (deps.includes('baileys') || deps.includes('@whiskeysockets/baileys')) {
                    appState.botLibrary = 'baileys';
                    console.log('[Panel] Librería detectada: baileys');
                }
            }
        }
    } catch (error) {
        console.error('[Panel] Error detectando librería:', error);
    }
}

// ========== SISTEMA DE ACTUALIZACIONES ==========

async function checkForUpdates() {
    try {
        const result = await window.electronAPI.checkForUpdates();
        
        if (result.success) {
            if (result.hasUpdate) {
                showNotification(`Nueva versión: ${result.latestVersion}`, 'info');
                return { hasUpdate: true, ...result };
            } else {
                showNotification('Estás actualizado', 'success');
                return { hasUpdate: false, ...result };
            }
        }
        return { hasUpdate: false, ...result };
    } catch (error) {
        console.error('[Panel] Error checking updates:', error);
        return { hasUpdate: false, error: error.message };
    }
}

async function downloadUpdate() {
    showNotification('Descargando actualización...', 'info');
    try {
        const result = await window.electronAPI.downloadUpdate();
        if (result.success) {
            showNotification('Actualización descargada', 'success');
            return true;
        } else {
            showNotification(result.message || 'Error', 'error');
            return false;
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
        return false;
    }
}

async function applyUpdate() {
    try {
        const result = await window.electronAPI.applyUpdate();
        if (result.success) {
            showNotification('Actualización aplicada. Reiniciando...', 'success');
            return true;
        } else {
            showNotification(result.message || 'Error', 'error');
            return false;
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
        return false;
    }
}

// ========== SISTEMA DE NOTIFICACIONES ==========

async function loadNotifications() {
    try {
        const result = await window.electronAPI.getNotificationHistory();
        if (result.success && result.notifications) {
            renderNotifications(result.notifications);
        }
    } catch (error) {
        console.error('[Panel] Error cargando notificaciones:', error);
    }
}

function renderNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay notificaciones</p>';
        return;
    }

    container.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
            <div class="notification-content">
                <span class="notification-title">${escapeHtml(notification.title)}</span>
                <span class="notification-message">${escapeHtml(notification.message)}</span>
                <span class="notification-time">${new Date(notification.timestamp).toLocaleString('es-ES')}</span>
            </div>
        </div>
    `).join('');
}

async function markNotificationAsRead(notificationId) {
    try {
        await window.electronAPI.markNotificationRead(notificationId);
        const element = document.querySelector(`[data-id="${notificationId}"]`);
        if (element) {
            element.classList.remove('unread');
            element.classList.add('read');
        }
    } catch (error) {
        console.error('[Panel] Error marking notification:', error);
    }
}

async function loadOwners() {
    try {
        const result = await window.electronAPI.getOwners();
        if (result.success && result.owners) {
            return result.owners;
        }
    } catch (error) {
        console.error('[Panel] Error cargando owners:', error);
    }
    return [];
}

// Escuchar notificaciones en tiempo real
window.electronAPI.onNotificationReceived((data) => {
    showNotification(`${data.title}: ${data.message}`, 'info');
    addLogToBox(`Notificación: ${data.title}`, 'info');
    loadNotifications();
});

// Navegación
function navigateTo(viewName) {
    document.querySelectorAll('.main-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const target = document.getElementById('view-' + viewName);
    if (target) {
        target.style.display = 'block';
        target.classList.add('active');
    }

    const navItem = document.querySelector(`[data-view="${viewName}"]`);
    if (navItem) navItem.classList.add('active');

    appState.currentView = viewName;

    if (viewName === 'dashboard') loadDashboardData();
    if (viewName === 'bots') loadBotFiles();
    if (viewName === 'editor') {
        loadBotFiles();
        showEditorEmptyState();
    }
}

// ========== CONFIGURACIÓN DEL BOT EXTERNO ==========

async function loadSavedBotPath() {
    try {
        const result = await window.electronAPI.getBotPath();
        if (result.path) {
            appState.botPath = result.path;
            const botPathInput = document.getElementById('botPath');
            const botsViewPath = document.getElementById('botsViewPath');
            if (botPathInput) botPathInput.value = result.path;
            if (botsViewPath) botsViewPath.value = result.path;
        }
    } catch (error) {
        console.error('[Panel] Error cargando ruta:', error);
    }
}

async function selectBotFolder() {
    try {
        const result = await window.electronAPI.selectBotFolder();
        if (result.path) {
            const botPathInput = document.getElementById('botPath');
            const botsViewPath = document.getElementById('botsViewPath');
            if (botPathInput) botPathInput.value = result.path;
            if (botsViewPath) botsViewPath.value = result.path;
        }
    } catch (error) {
        console.error('[Panel] Error seleccionando carpeta:', error);
    }
}

async function selectBotFolderFromView() {
    await selectBotFolder();
}

async function saveBotPath() {
    const path = document.getElementById('botPath')?.value.trim();
    if (!path) {
        showNotification('Ingresa la ruta del bot', 'warning');
        return;
    }

    try {
        const result = await window.electronAPI.saveBotPath(path);
        if (result.success) {
            appState.botPath = path;
            showNotification('Ruta guardada correctamente', 'success');
        } else {
            showNotification('Error guardando ruta', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

async function saveBotPathFromView() {
    const path = document.getElementById('botsViewPath')?.value.trim();
    if (!path) {
        showNotification('Ingresa la ruta del bot', 'warning');
        return;
    }

    try {
        const result = await window.electronAPI.saveBotPath(path);
        if (result.success) {
            appState.botPath = path;
            const botPathInput = document.getElementById('botPath');
            if (botPathInput) botPathInput.value = path;
            showNotification('Ruta guardada correctamente', 'success');
        } else {
            showNotification('Error guardando ruta', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

async function startExternalBot() {
    const botPath = appState.botPath || document.getElementById('botPath')?.value.trim();

    if (!botPath) {
        showNotification('Primero configura la ruta del bot', 'warning');
        navigateTo('bots');
        return;
    }

    try {
        showNotification('Iniciando bot...', 'info');
        const result = await window.electronAPI.startExternalBot(botPath);

        if (result.success) {
            showNotification('Bot iniciado correctamente', 'success');
            updateStatusIndicator('running');
            addLogToBox(`Bot iniciado desde: ${botPath}`, 'success');
        } else {
            showNotification(result.error || 'Error iniciando bot', 'error');
            addLogToBox(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
        addLogToBox(`Error: ${error.message}`, 'error');
    }
}

async function stopExternalBot() {
    try {
        const result = await window.electronAPI.stopExternalBot();
        if (result.success) {
            showNotification('Bot detenido', 'warning');
            updateStatusIndicator('stopped');
            addLogToBox('Bot detenido', 'warning');
        } else {
            showNotification('Error deteniendo bot', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

function addLogToBox(message, type = 'info') {
    const logsBox = document.getElementById('logsBox');
    if (logsBox) {
        const timestamp = new Date().toLocaleTimeString('es-ES');
        const logHtml = `<div class="log-line ${type}"><span class="log-time">[${timestamp}]</span>${message}</div>`;
        logsBox.insertAdjacentHTML('afterbegin', logHtml);
    }
}

// ========== EDITOR DE ARCHIVOS Y IA ==========

async function loadBotFiles() {
    const botPath = appState.botPath || document.getElementById('botsViewPath')?.value.trim();

    if (!botPath) {
        showNotification('Primero configura la ruta del bot', 'warning');
        return;
    }

    try {
        const result = await window.electronAPI.listBotFiles(botPath);

        if (result.success) {
            appState.fileTree = result.tree;
            renderFileTree(result.tree, elements.fileExplorer);
        } else {
            showNotification(result.message || 'Error cargando archivos', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

function renderFileTree(tree, container) {
    if (!container) return;

    container.innerHTML = '';

    const rootElement = document.createElement('div');
    rootElement.className = 'file-tree-root';
    rootElement.innerHTML = `<div class="tree-toggle expanded">▼</div><span class="tree-folder-name">${tree.name}</span>`;

    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'tree-children';

    if (tree.children && tree.children.length > 0) {
        tree.children.forEach(child => {
            if (child.type === 'directory') {
                childrenContainer.appendChild(createFolderElement(child));
            } else {
                childrenContainer.appendChild(createFileElement(child));
            }
        });
    } else {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'tree-empty';
        emptyMsg.textContent = 'Carpeta vacía';
        childrenContainer.appendChild(emptyMsg);
    }

    rootElement.appendChild(childrenContainer);
    container.appendChild(rootElement);
}

function createFolderElement(folder) {
    const element = document.createElement('div');
    element.className = 'tree-folder';

    const toggle = document.createElement('span');
    toggle.className = 'tree-toggle';
    toggle.textContent = '▶';
    toggle.onclick = (e) => {
        e.stopPropagation();
        toggle.classList.toggle('expanded');
        element.querySelector('.tree-children').style.display =
            toggle.classList.contains('expanded') ? 'block' : 'none';
    };

    const name = document.createElement('span');
    name.className = 'tree-folder-name';
    name.textContent = folder.name;
    name.onclick = () => {
        toggle.click();
    };

    const children = document.createElement('div');
    children.className = 'tree-children';
    children.style.display = 'none';

    if (folder.children && folder.children.length > 0) {
        folder.children.forEach(child => {
            if (child.type === 'directory') {
                children.appendChild(createFolderElement(child));
            } else {
                children.appendChild(createFileElement(child));
            }
        });
    }

    element.appendChild(toggle);
    element.appendChild(name);
    element.appendChild(children);

    return element;
}

function createFileElement(file) {
    const element = document.createElement('div');
    element.className = 'tree-file';
    element.dataset.path = file.path;
    element.dataset.relativePath = file.relativePath;

    const icon = document.createElement('span');
    icon.className = 'file-icon';
    icon.textContent = getFileIcon(file.extension);

    const name = document.createElement('span');
    name.className = 'file-name';
    name.textContent = file.name;

    element.appendChild(icon);
    element.appendChild(name);

    element.onclick = () => {
        document.querySelectorAll('.tree-file').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
        openFileInEditor(file.path, file.relativePath);
    };

    return element;
}

function getFileIcon(extension) {
    const icons = {
        '.js': '📜',
        '.json': '📋',
        '.ts': '📘',
        '.html': '🌐',
        '.css': '🎨',
        '.md': '📝',
        '.txt': '📄'
    };
    return icons[extension] || '📄';
}

async function openFileInEditor(filePath, relativePath) {
    try {
        const result = await window.electronAPI.readFile(filePath);

        if (result.success) {
            appState.currentFile = {
                path: filePath,
                relativePath: relativePath,
                originalContent: result.content,
                isProtected: result.isProtected || false
            };

            appState.editorContent = result.content;
            appState.modifiedContent = result.content;

            showEditorContent(result.content, result.fileName);
            showAIPanel();
            updateEditorStatus();
        } else {
            showNotification(result.message || 'Error leyendo archivo', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

function setupTextEditor() {
    const editor = elements.codeEditor;
    if (!editor) return;

    editor.addEventListener('input', (e) => {
        appState.modifiedContent = e.target.value;
        updateEditorStatus();
    });

    editor.addEventListener('keydown', (e) => {
        // Ctrl+S para guardar
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveCurrentFile();
        }
        // Tab para indentación
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 4;
            appState.modifiedContent = editor.value;
            updateEditorStatus();
        }
    });
}

function showEditorContent(content, fileName) {
    const editor = elements.codeEditor;
    const fileNameDisplay = document.getElementById('currentFileName');

    if (editor) {
        editor.value = content;
        editor.style.display = 'block';
    }

    if (fileNameDisplay) {
        fileNameDisplay.textContent = fileName || 'Sin archivo abierto';
    }

    const emptyState = document.getElementById('editorEmptyState');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
}

function showEditorEmptyState() {
    const editor = elements.codeEditor;
    const fileNameDisplay = document.getElementById('currentFileName');
    const emptyState = document.getElementById('editorEmptyState');

    if (editor) {
        editor.value = '';
        editor.style.display = 'none';
    }

    if (fileNameDisplay) {
        fileNameDisplay.textContent = 'Sin archivo abierto';
    }

    if (emptyState) {
        emptyState.style.display = 'flex';
    }
}

function updateEditorStatus() {
    const statusEl = document.getElementById('editorStatus');
    const saveBtn = document.getElementById('saveFileBtn');

    if (!appState.currentFile) {
        if (statusEl) statusEl.textContent = 'Sin archivo';
        return;
    }

    const isModified = appState.modifiedContent !== appState.editorContent;
    const isProtected = appState.currentFile.isProtected;

    if (statusEl) {
        if (isProtected) {
            statusEl.textContent = 'Solo lectura';
            statusEl.className = 'editor-status protected';
        } else if (isModified) {
            statusEl.textContent = 'Modificado';
            statusEl.className = 'editor-status modified';
        } else {
            statusEl.textContent = 'Guardado';
            statusEl.className = 'editor-status saved';
        }
    }

    if (saveBtn) {
        saveBtn.disabled = isProtected || !isModified;
    }
}

async function saveCurrentFile() {
    if (!appState.currentFile) {
        showNotification('No hay archivo abierto', 'warning');
        return;
    }

    if (appState.currentFile.isProtected) {
        showNotification('Este archivo está protegido', 'error');
        return;
    }

    if (appState.modifiedContent === appState.editorContent) {
        showNotification('No hay cambios que guardar', 'info');
        return;
    }

    try {
        const result = await window.electronAPI.writeFile(
            appState.currentFile.path,
            appState.modifiedContent,
            appState.botPath
        );

        if (result.success) {
            appState.editorContent = appState.modifiedContent;
            updateEditorStatus();
            showNotification('Archivo guardado correctamente', 'success');
        } else {
            showNotification(result.message || 'Error guardando', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

async function createNewFile() {
    const fileName = prompt('Nombre del nuevo archivo:', 'nuevo-archivo.js');

    if (!fileName) return;

    const botPath = appState.botPath;
    if (!botPath) {
        showNotification('Primero configura la ruta del bot', 'warning');
        return;
    }

    try {
        const result = await window.electronAPI.createFile(botPath, fileName, '// Nuevo archivo\n');

        if (result.success) {
            showNotification('Archivo creado', 'success');
            loadBotFiles();
            openFileInEditor(result.filePath, fileName);
        } else {
            showNotification(result.message || 'Error creando archivo', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

async function deleteCurrentFile() {
    if (!appState.currentFile) {
        showNotification('No hay archivo seleccionado', 'warning');
        return;
    }

    if (appState.currentFile.isProtected) {
        showNotification('No puedes eliminar archivos protegidos', 'error');
        return;
    }

    const confirmDelete = confirm(`¿Eliminar ${appState.currentFile.relativePath}?`);

    if (!confirmDelete) return;

    try {
        const result = await window.electronAPI.deleteFile(
            appState.currentFile.path,
            appState.botPath
        );

        if (result.success) {
            showNotification('Archivo eliminado', 'success');
            appState.currentFile = null;
            showEditorEmptyState();
            loadBotFiles();
        } else {
            showNotification(result.message || 'Error eliminando', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

async function discardChanges() {
    if (!appState.currentFile) return;

    appState.modifiedContent = appState.editorContent;
    elements.codeEditor.value = appState.editorContent;
    updateEditorStatus();
    showNotification('Cambios descartados', 'info');
}

// ========== PANEL DE IA ==========

function showAIPanel() {
    const aiPanel = document.getElementById('aiPanel');
    const editorSection = document.getElementById('editorSection');

    if (aiPanel) aiPanel.style.display = 'flex';
    if (editorSection) {
        editorSection.style.display = 'grid';
        editorSection.style.gridTemplateColumns = '1fr 350px';
    }
}

function hideAIPanel() {
    const aiPanel = document.getElementById('aiPanel');
    const editorSection = document.getElementById('editorSection');

    if (aiPanel) aiPanel.style.display = 'none';
    if (editorSection) {
        editorSection.style.display = 'block';
    }
}

async function sendToAI() {
    const prompt = elements.aiPrompt?.value.trim();

    if (!prompt) {
        showNotification('Escribe una instrucción', 'warning');
        return;
    }

    const loadingEl = document.getElementById('aiLoading');
    const responseEl = elements.aiResponse;

    if (loadingEl) loadingEl.style.display = 'flex';
    if (responseEl) responseEl.innerHTML = '';

    try {
        // Construir contexto avanzado
        let contextInfo = '';
        
        // Información de la librería del bot
        contextInfo += `\n📱 LIBRERÍA DEL BOT: ${appState.botLibrary}\n`;
        
        // Si hay un archivo abierto, incluir su contenido
        if (appState.currentFile) {
            const currentContent = appState.modifiedContent;
            contextInfo += `\n📄 ARCHIVO ACTUAL (${appState.currentFile.relativePath}):\n\`\`\`javascript\n${currentContent}\n\`\`\`\n`;
        }

        // Construir mensaje completo para la IA
        const fullPrompt = `Contexto del proyecto XPE-BOT:
${contextInfo}

🎯 PETICIÓN DEL USUARIO:
${prompt}

Por favor:
1. Si es código, genera solo el código necesario
2. Incluye explicaciones si es complejo
3. Usa la sintaxis correcta para ${appState.botLibrary}
4. Añade comentarios importantes`;

        const result = await window.electronAIChat(fullPrompt, getLanguagePrompt(), appState.botLibrary);

        if (loadingEl) loadingEl.style.display = 'none';

        if (result.success) {
            if (responseEl) {
                responseEl.innerHTML = `
                    <div class="ai-result-header">
                        <span class="ai-status success">✓ Respuesta generada</span>
                    </div>
                    <div class="ai-code-preview">${escapeHtml(result.response)}</div>
                `;
            }
            appState.aiGeneratedCode = result.response;
        } else {
            if (responseEl) {
                responseEl.innerHTML = `
                    <div class="ai-result-header">
                        <span class="ai-status error">✗ Error</span>
                    </div>
                    <div class="ai-error">${result.message}</div>
                `;
            }
            showNotification(result.message || 'Error con XPE Assistant', 'error');
        }
    } catch (error) {
        if (loadingEl) loadingEl.style.display = 'none';
        showNotification('Error: ' + error.message, 'error');
    }
}

async function sendChatToAI() {
    const prompt = elements.aiPrompt?.value.trim();

    if (!prompt) {
        showNotification('Escribe algo para chatear', 'warning');
        return;
    }

    const loadingEl = document.getElementById('aiLoading');
    const responseEl = elements.aiResponse;

    if (loadingEl) loadingEl.style.display = 'flex';
    if (responseEl) responseEl.innerHTML = '';

    try {
        // Obtener contexto del bot
        let contextInfo = '';
        contextInfo += `\n📱 LIBRERÍA DEL BOT: ${appState.botLibrary}\n`;
        
        // Si hay archivos del bot, mencionar
        if (appState.fileTree) {
            contextInfo += `\n📁 ARCHIVOS DEL BOT DISPONIBLES\n`;
        }

        const fullPrompt = `Contexto del proyecto XPE-BOT:
${contextInfo}

💬 CONVERSACIÓN:
${prompt}

XPE Assistant, responde de forma útil y concisa.`;

        const result = await window.electronAIChat(fullPrompt, getLanguagePrompt(), appState.botLibrary);

        if (loadingEl) loadingEl.style.display = 'none';

        if (result.success) {
            if (responseEl) {
                responseEl.innerHTML = `
                    <div class="ai-result-header">
                        <span class="ai-status success">✓</span>
                    </div>
                    <div class="ai-code-preview">${escapeHtml(result.response)}</div>
                `;
            }
        } else {
            if (responseEl) {
                responseEl.innerHTML = `
                    <div class="ai-result-header">
                        <span class="ai-status error">✗ Error</span>
                    </div>
                    <div class="ai-error">${result.message}</div>
                `;
            }
        }
    } catch (error) {
        if (loadingEl) loadingEl.style.display = 'none';
        showNotification('Error: ' + error.message, 'error');
    }
}

function applyAIChanges() {
    if (appState.aiGeneratedCode) {
        appState.modifiedContent = appState.aiGeneratedCode;
        elements.codeEditor.value = appState.aiGeneratedCode;
        updateEditorStatus();

        const responseEl = elements.aiResponse;
        if (responseEl) {
            responseEl.innerHTML = `
                <div class="ai-result-header">
                    <span class="ai-status success">✓ Cambios aplicados</span>
                </div>
                <p class="ai-info">Presiona Ctrl+S para guardar o revisa los cambios antes de guardar.</p>
            `;
        }

        showNotification('Cambios aplicados al editor', 'success');
    }
}

function clearAIPrompt() {
    if (elements.aiPrompt) {
        elements.aiPrompt.value = '';
        elements.aiPrompt.placeholder = 'Describe qué necesitas para tu bot...\n\nEjemplos:\n- Crea un comando para ver el clima\n- Explica cómo agregar APIs externas\n- Genera un sistema de niveles\n- Depura este error: [pegar error]';
    }
    if (elements.aiResponse) elements.aiResponse.innerHTML = '';
}

async function quickAICommand(commandType) {
    if (!elements.aiPrompt) return;
    
    const prompts = {
        'crear comando de bienvenida': `Crea un comando de bienvenida para grupos que:
- Detecte cuando alguien entra al grupo
- Envíe un mensaje de bienvenida con el nombre del usuario
- Muestre las reglas del grupo
- Incluya un sticker de bienvenida
- Use la librería ${appState.botLibrary}`,
        
        'crear comando de stickers': `Crea un comando de stickers que:
- Convierta imágenes a stickers
- Permita usar imágenes de internet o adjuntos
- Use MessageMedia de ${appState.botLibrary}
- Incluya manejo de errores
- Responda con el sticker creado`,
        
        'crear comando anti-spam': `Crea un sistema anti-spam que:
- Detecte mensajes repetidos
- Mutee automáticamente spammers
- Lleje un contador de advertencias
- Envíe warn al usuario
- Use la librería ${appState.botLibrary}`,
        
        'crear comando de economia': `Crea un sistema de economía que:
- Guarde los coins en un archivo JSON
- Permita ganar coins por mensajes
- Incluya comando para ver balance
- Tienda para gastar coins
- Use ${appState.botLibrary}`
    };
    
    if (prompts[commandType]) {
        elements.aiPrompt.value = prompts[commandType];
        showNotification('Plantilla cargada', 'success');
        elements.aiPrompt.focus();
    }
}

// ========== CONFIGURACIÓN DE API ==========

async function loadApiKey() {
    try {
        const result = await window.electronAPI.loadApiKey();
        const apiKeyInput = document.getElementById('openaiApiKey');

        if (apiKeyInput && result.apiKey) {
            apiKeyInput.value = result.apiKey;
        }
    } catch (error) {
        console.error('[Panel] Error cargando API key:', error);
    }
}

async function saveApiKey() {
    const apiKey = document.getElementById('openaiApiKey')?.value.trim();

    if (!apiKey) {
        showNotification('Ingresa la clave de API', 'warning');
        return;
    }

    try {
        const result = await window.electronAPI.saveApiKey(apiKey);

        if (result.success) {
            showNotification('Clave de API guardada', 'success');
        } else {
            showNotification('Error guardando clave', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// ========== RESPALDOS ==========

async function loadBackups() {
    try {
        const result = await window.electronAPI.listBackups();

        if (result.success && result.backups) {
            renderBackupList(result.backups);
        }
    } catch (error) {
        console.error('[Panel] Error cargando respaldos:', error);
    }
}

function renderBackupList(backups) {
    const container = document.getElementById('backupList');

    if (!container) return;

    if (backups.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay respaldos disponibles</p>';
        return;
    }

    container.innerHTML = backups.map(backup => `
        <div class="backup-item" data-path="${backup.path}">
            <div class="backup-info">
                <span class="backup-name">${backup.name}</span>
                <span class="backup-date">${new Date(backup.created).toLocaleString('es-ES')}</span>
            </div>
            <button class="btn-restore" onclick="restoreBackup('${backup.path.replace(/\\/g, '\\\\')}')">Restaurar</button>
        </div>
    `).join('');
}

async function restoreBackup(backupPath) {
    if (!appState.currentFile) {
        showNotification('Primero abre el archivo a restaurar', 'warning');
        return;
    }

    const confirmRestore = confirm('¿Restaurar este respaldo? Se sobrescribirá el archivo actual.');

    if (!confirmRestore) return;

    try {
        const result = await window.electronAPI.restoreBackup(backupPath, appState.currentFile.path);

        if (result.success) {
            showNotification('Respaldo restaurado', 'success');
            openFileInEditor(appState.currentFile.path, appState.currentFile.relativePath);
        } else {
            showNotification(result.message || 'Error restaurando', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== ENVÍO DE MENSAJES ==========

async function sendQuickMessage() {
    const jid = document.getElementById('quickJid')?.value;
    const message = document.getElementById('messageInput')?.value;

    if (!jid || !message) {
        showNotification('Completa destinatario y mensaje', 'warning');
        return;
    }

    try {
        const result = await window.electronAPI.sendMessage({ jid, message });
        if (result.success) {
            showNotification('Mensaje enviado', 'success');
            const messageInput = document.getElementById('messageInput');
            if (messageInput) messageInput.value = '';
        } else {
            showNotification(result.error || 'Error', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

function updateStatusIndicator(status) {
    const indicator = document.getElementById('statusIndicator');
    if (indicator) {
        indicator.className = 'status-indicator';
        if (status === 'running' || status === 'connected') indicator.classList.add('running');
        else if (status === 'connecting') indicator.classList.add('connecting');
        else indicator.classList.remove('running', 'connecting');
    }
}

// Notificaciones
function showNotification(message, type = 'info') {
    if (!elements.notification) return;
    elements.notification.textContent = message;
    elements.notification.className = `notification ${type} show`;
    setTimeout(() => elements.notification.classList.remove('show'), 4000);
}

// Window controls
function minimizeWindow() { window.electronAPI.minimize(); }
function maximizeWindow() { window.electronAPI.maximize(); }
function closeWindow() { window.electronAPI.close(); }

// Escuchar eventos del bot
window.electronAPI.onBotLog((data) => {
    addLogToBox(data.message, data.type || 'info');
});

window.electronAPI.onBotStatus((data) => {
    updateStatusIndicator(data.status);
    showNotification(data.message, data.status === 'connected' ? 'success' : 'info');
});

// Funciones globales
window.navigateTo = navigateTo;
window.selectBotFolder = selectBotFolder;
window.selectBotFolderFromView = selectBotFolderFromView;
window.saveBotPath = saveBotPath;
window.saveBotPathFromView = saveBotPathFromView;
window.startExternalBot = startExternalBot;
window.stopExternalBot = stopExternalBot;
window.sendQuickMessage = sendQuickMessage;
window.minimizeWindow = minimizeWindow;
window.maximizeWindow = maximizeWindow;
window.closeWindow = closeWindow;
window.refreshCurrentView = () => { loadDashboardData(); };
window.saveCurrentFile = saveCurrentFile;
window.createNewFile = createNewFile;
window.deleteCurrentFile = deleteCurrentFile;
window.discardChanges = discardChanges;
window.sendToAI = sendToAI;
window.sendChatToAI = sendChatToAI;
window.clearAIPrompt = clearAIPrompt;
window.restoreBackup = restoreBackup;
window.saveApiKey = saveApiKey;
window.loadBackups = loadBackups;
window.checkForUpdates = checkForUpdates;
window.downloadUpdate = downloadUpdate;
window.applyUpdate = applyUpdate;
window.loadNotifications = loadNotifications;
window.markNotificationAsRead = markNotificationAsRead;
window.loadOwners = loadOwners;
window.changeLanguage = changeLanguage;

// Funciones de IA avanzadas
window.generateAICode = async (request) => {
    try {
        const result = await window.electronAPI.aiGenerateCode(request, appState.botLibrary, '');
        return result;
    } catch (error) {
        console.error('[Panel] Error generando código:', error);
        return { success: false, message: error.message };
    }
};

window.analyzeAICode = async (code) => {
    try {
        const result = await window.electronAPI.aiAnalyzeCode(code, appState.botLibrary);
        return result;
    } catch (error) {
        console.error('[Panel] Error analizando código:', error);
        return { success: false, message: error.message };
    }
};

window.suggestAICommand = async (commandName) => {
    try {
        const result = await window.electronAPI.aiSuggestCommand(commandName, appState.botLibrary);
        return result;
    } catch (error) {
        console.error('[Panel] Error sugiriendo comando:', error);
        return { success: false, message: error.message };
    }
};

window.quickAICommand = quickAICommand;

// Prevenir menú contextual
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) e.preventDefault();
});
