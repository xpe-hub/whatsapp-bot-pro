// XPE-BOT Panel - Lógica de la Interfaz

let appState = {
    isLicensed: false,
    licenseType: null,
    permissions: [],
    hwid: null,
    stats: { totalMessages: 0, totalCommands: 0, totalUsers: 0 }
};

// Elementos
const elements = {
    loginScreen: null,
    mainContent: null,
    licenseInput: null,
    notification: null
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Panel] XPE-BOT Panel iniciado');

    // Cache elementos
    elements.loginScreen = document.getElementById('loginScreen');
    elements.mainContent = document.getElementById('mainContent');
    elements.licenseInput = document.getElementById('licenseInput');
    elements.notification = document.getElementById('notification');

    // Enter en licencia
    if (elements.licenseInput) {
        elements.licenseInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }

    // Verificar licencia guardada
    await checkSavedLicense();

    // Obtener versión
    const version = await window.electronAPI.getAppVersion();
    console.log('[Panel] Version:', version);
});

async function checkSavedLicense() {
    try {
        const result = await window.electronAPI.checkSavedLicense();
        if (result.valid) {
            appState.isLicensed = true;
            appState.licenseType = result.type;
            showNotification('Licencia: ' + result.type, 'success');
            showMainInterface();
        }
    } catch (error) {
        console.error('[Panel] Error licencia:', error);
    }
}

async function login() {
    const licenseKey = elements.licenseInput?.value.trim();

    if (!licenseKey) {
        showNotification('Ingresa la licencia', 'warning');
        return;
    }

    try {
        showNotification('Validando...', 'info');
        const result = await window.electronAPI.activateLicense(licenseKey);

        if (result.valid) {
            appState.isLicensed = true;
            appState.licenseType = result.type;
            appState.permissions = result.permissions || [];
            showNotification(result.message, 'success');
            showMainInterface();
        } else {
            showNotification(result.error || 'Licencia inválida', 'error');
        }
    } catch (error) {
        console.error('[Panel] Error login:', error);
        showNotification('Error validando', 'error');
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

    // Cargar datos según vista
    if (viewName === 'dashboard') loadDashboardData();
    if (viewName === 'admins') loadAdmins();
    if (viewName === 'vips') loadVips();
}

// Administradores
async function loadAdmins() {
    try {
        const admins = await window.electronAPI.adminsGet();
        const container = document.getElementById('adminsList');
        if (!container) return;

        if (admins.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No hay administradores</p><button class="btn btn-primary mt-2" onclick="showAddAdminModal()">Agregar</button></div>';
            return;
        }

        container.innerHTML = admins.map(admin => `
            <div class="admin-card">
                <div class="admin-info">
                    <span class="admin-name">${admin.name}</span>
                    <span class="admin-jid">${admin.jid}</span>
                    <span class="badge badge-${admin.role}">${admin.role}</span>
                </div>
                <button class="btn btn-sm btn-danger" onclick="removeAdmin('${admin.jid}')">Eliminar</button>
            </div>
        `).join('');
    } catch (error) { console.error('[Panel] Error admins:', error); }
}

async function showAddAdminModal() {
    const jid = prompt('JID del administrador:');
    if (!jid) return;
    const name = prompt('Nombre:');
    if (!name) return;

    const result = await window.electronAPI.adminsAdd({ jid, name, role: 'mod' });
    if (result.success) {
        showNotification('Admin agregado', 'success');
        loadAdmins();
    } else {
        showNotification(result.error || 'Error', 'error');
    }
}

async function removeAdmin(jid) {
    if (!confirm('¿Eliminar admin?')) return;
    const result = await window.electronAPI.adminsRemove(jid);
    if (result.success) {
        showNotification('Admin eliminado', 'success');
        loadAdmins();
    }
}

// VIPs
async function loadVips() {
    try {
        const vips = await window.electronAPI.vipsGet();
        const container = document.getElementById('vipsList');
        if (!container) return;

        if (vips.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No hay VIPs</p><button class="btn btn-primary mt-2" onclick="showAddVipModal()">Agregar</button></div>';
            return;
        }

        container.innerHTML = vips.map(vip => `
            <div class="vip-card">
                <div class="vip-info">
                    <span class="vip-name">${vip.name}</span>
                    <span class="vip-jid">${vip.jid}</span>
                    <div class="vip-details">
                        <span class="badge badge-${vip.plan}">${vip.plan}</span>
                        <span>Expira: ${new Date(vip.expirationDate).toLocaleDateString()}</span>
                    </div>
                </div>
                <button class="btn btn-sm btn-danger" onclick="removeVip('${vip.jid}')">Eliminar</button>
            </div>
        `).join('');
    } catch (error) { console.error('[Panel] Error vips:', error); }
}

async function showAddVipModal() {
    const jid = prompt('JID del VIP:');
    if (!jid) return;
    const name = prompt('Nombre:');
    if (!name) return;
    const days = parseInt(prompt('Días:', '30') || '30');

    const result = await window.electronAPI.vipsAdd({ jid, name, days, plan: 'premium' });
    if (result.success) {
        showNotification('VIP agregado', 'success');
        loadVips();
    } else {
        showNotification(result.error || 'Error', 'error');
    }
}

async function removeVip(jid) {
    if (!confirm('¿Eliminar VIP?')) return;
    const result = await window.electronAPI.vipsRemove(jid);
    if (result.success) {
        showNotification('VIP eliminado', 'success');
        loadVips();
    }
}

// IA
async function generateAISuggestion() {
    try {
        showNotification('IA analizando...', 'info');
        const result = await window.electronAPI.aiSuggestReply({ message: 'Hola' });
        if (result.success) {
            const container = document.getElementById('aiSuggestion');
            if (container) {
                container.innerHTML = `
                    <div class="ai-result">
                        <p>${result.suggestion}</p>
                        <div class="ai-actions">
                            <button class="btn btn-sm btn-primary" onclick="applyAISuggestion()">Usar</button>
                            <button class="btn btn-sm btn-secondary" onclick="dismissAISuggestion()">Cerrar</button>
                        </div>
                    </div>
                `;
                container.style.display = 'block';
            }
        }
    } catch (error) {
        showNotification('Error IA', 'error');
    }
}

function dismissAISuggestion() {
    const container = document.getElementById('aiSuggestion');
    if (container) container.style.display = 'none';
}

function applyAISuggestion() {
    // Por implementar
    dismissAISuggestion();
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

// Funciones globales
window.navigateTo = navigateTo;
window.showAddAdminModal = showAddAdminModal;
window.removeAdmin = removeAdmin;
window.showAddVipModal = showAddVipModal;
window.removeVip = removeVip;
window.generateAISuggestion = generateAISuggestion;
window.applyAISuggestion = applyAISuggestion;
window.dismissAISuggestion = dismissAISuggestion;
window.minimizeWindow = minimizeWindow;
window.maximizeWindow = maximizeWindow;
window.closeWindow = closeWindow;

// Prevenir menú contextual
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) e.preventDefault();
});
