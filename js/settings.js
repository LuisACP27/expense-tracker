// settings.js - Lógica de la página de ajustes

class SettingsPage {
    constructor() {
        this.userPrefix = localStorage.getItem('current_user_prefix') || '';
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Selector de tema
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.changeTheme(e.target.value, true);
        });

        // Switch de modo nocturno
        document.getElementById('night-mode-toggle').addEventListener('change', (e) => {
            this.toggleNightMode(e.target.checked);
        });

        // Selector de idioma
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value, true);
        });

        // Botones de acciones
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data').addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('clear-data').addEventListener('click', () => {
            this.clearData();
        });

        // Botón de cambio de seguridad
        document.getElementById('change-security').addEventListener('click', () => {
            this.changeSecurityOptions();
        });

        // Botón de cerrar sesión
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    }

    loadSettings() {
        // Cargar tema actual usando el sistema global
        if (window.appTheme) {
            const currentTheme = window.appTheme.getCurrentTheme();
            document.getElementById('theme-select').value = currentTheme;
            
            // Aplicar el tema actual
            window.appTheme.applyCurrentTheme();
        }

        // Cargar modo oscuro usando el sistema global
        if (window.appTheme) {
            const darkModeEnabled = window.appTheme.isDarkModeEnabled();
            document.getElementById('night-mode-toggle').checked = darkModeEnabled;
        }

        // Cargar idioma actual
        const currentLang = localStorage.getItem('language') || 'es';
        document.getElementById('language-select').value = currentLang;
        this.changeLanguage(currentLang, false);

        // Cargar información del usuario
        this.loadUserInfo();
    }

    loadUserInfo() {
        const userName = localStorage.getItem('user_name');
        const userEmail = localStorage.getItem('user_email');
        const userPhoto = localStorage.getItem('user_photo');

        const userInfo = document.getElementById('user-account-info');
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="user-info-header">
                    <img src="${userPhoto || 'https://via.placeholder.com/50'}" alt="Avatar" class="user-avatar">
                    <div class="user-details">
                        <p class="user-name">${userName || 'Usuario'}</p>
                        <p class="user-email">${userEmail || 'correo@ejemplo.com'}</p>
                    </div>
                </div>
            `;
        }
    }

    changeTheme(theme, showNotification = true) {
        if (window.appTheme) {
            window.appTheme.changeTheme(theme);
            
            if (showNotification) {
                this.showNotification('Tema cambiado correctamente', 'success');
            }
        }
    }

    toggleNightMode(enabled) {
        if (window.appTheme) {
            window.appTheme.toggleDarkMode(enabled);
            this.showNotification(enabled ? 'Modo oscuro activado' : 'Modo oscuro desactivado', 'success');
        }
    }

    changeLanguage(lang, showNotification = true) {
        localStorage.setItem('language', lang);
        
        if (showNotification) {
            this.showNotification('Idioma cambiado correctamente', 'success');
        }
    }

    changeSecurityOptions() {
        // Limpiar la sesión actual antes de cambiar el método de seguridad
        sessionStorage.removeItem('pin_ok');
        // Redirigir a la página de opciones de seguridad con parámetro para indicar cambio
        window.location.href = 'security-options.html?change=true';
    }

    exportData() {
        try {
            storage.exportData();
            this.showNotification('Datos exportados correctamente', 'success');
        } catch (error) {
            this.showNotification('Error al exportar datos', 'error');
            console.error('Error exporting data:', error);
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            storage.importData(file)
                .then(() => {
                    this.showNotification('Datos importados correctamente', 'success');
                })
                .catch(error => {
                    this.showNotification('Error al importar datos: ' + error, 'error');
                });
        };
        
        input.click();
    }

    clearData() {
        if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
            try {
                storage.clearAllData();
                this.showNotification('Todos los datos han sido eliminados', 'success');
            } catch (error) {
                this.showNotification('Error al limpiar datos', 'error');
                console.error('Error clearing data:', error);
            }
        }
    }

    logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Limpiar datos de sesión
            sessionStorage.clear();
            // Redirigir a la página de inicio
            window.location.href = 'welcome.html';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Inicializar la página de ajustes cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    new SettingsPage();
}); 