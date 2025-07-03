// settings.js - Lógica de la página de ajustes

class SettingsPage {
    constructor() {
        this.userPrefix = localStorage.getItem('current_user_prefix') || '';
        this.themes = {
            green: {
                '--primary-color': '#4CAF50',
                '--secondary-color': '#53C5A8',
                '--background-color': '#f5f5f5',
                '--card-background': '#ffffff',
                '--border-color': '#e0e0e0',
                '--income-color': '#4CAF50',
                '--expense-color': '#f44336'
            },
            blue: {
                '--primary-color': '#2196F3',
                '--secondary-color': '#10d1c2',
                '--background-color': '#e3f2fd',
                '--card-background': '#ffffff',
                '--border-color': '#90caf9',
                '--income-color': '#2196F3',
                '--expense-color': '#f44336'
            },

            red: {
                '--primary-color': '#e53935',
                '--secondary-color': '#ff7043',
                '--background-color': '#fff5f5',
                '--card-background': '#fff',
                '--border-color': '#ffcdd2',
                '--income-color': '#e53935',
                '--expense-color': '#b71c1c'
            },
            purple: {
                '--primary-color': '#8e24aa',
                '--secondary-color': '#d82ccd',
                '--background-color': '#f3e5f5',
                '--card-background': '#fff',
                '--border-color': '#ce93d8',
                '--income-color': '#8e24aa',
                '--expense-color': '#d500f9'
            },
            orange: {
                '--primary-color': '#fb8c00',
                '--secondary-color': '#ffb300',
                '--background-color': '#fff3e0',
                '--card-background': '#fff',
                '--border-color': '#ffe0b2',
                '--income-color': '#fb8c00',
                '--expense-color': '#e65100'
            },
            gray: {
                '--primary-color': '#757575',
                '--secondary-color': '#bdbdbd',
                '--background-color': '#f5f5f5',
                '--card-background': '#fff',
                '--border-color': '#e0e0e0',
                '--income-color': '#757575',
                '--expense-color': '#bdbdbd'
            }
        };
        // Fijar los colores de texto para todos los temas
        document.documentElement.style.setProperty('--text-primary', '#212121');
        document.documentElement.style.setProperty('--text-secondary', '#666666');
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Selector de tema
        document.getElementById('theme-selector').addEventListener('change', (e) => {
            this.changeTheme(e.target.value, true);
        });

        // Switch de modo oscuro
        document.getElementById('dark-mode-toggle').addEventListener('change', (e) => {
            this.toggleDarkMode(e.target.checked);
        });

        // Selector de idioma
        document.getElementById('language-selector').addEventListener('change', (e) => {
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
        // Cargar tema actual
        const currentTheme = localStorage.getItem('theme') || 'green';
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.value = currentTheme;
            this.changeTheme(currentTheme, false);
        }

        // Cargar modo oscuro
        const darkMode = localStorage.getItem('dark_mode') === 'true';
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = darkMode;
            this.toggleDarkMode(darkMode);
        }

        // Cargar idioma actual
        const currentLang = localStorage.getItem('language') || 'es';
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.value = currentLang;
            this.changeLanguage(currentLang, false);
        }

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
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (showNotification) {
            this.showNotification('Tema cambiado correctamente', 'success');
        }
    }

    toggleDarkMode(enabled) {
        document.documentElement.classList.toggle('dark-mode', enabled);
        localStorage.setItem('dark_mode', enabled);
        
        // Aplicar estilos del modo oscuro
        if (enabled) {
            document.documentElement.style.setProperty('--background-color', '#121212');
            document.documentElement.style.setProperty('--card-background', '#1e1e1e');
            document.documentElement.style.setProperty('--text-primary', '#ffffff');
            document.documentElement.style.setProperty('--text-secondary', '#e0e0e0');
            document.documentElement.style.setProperty('--border-color', '#424242');
        } else {
            document.documentElement.style.setProperty('--background-color', '#f5f5f5');
            document.documentElement.style.setProperty('--card-background', '#ffffff');
            document.documentElement.style.setProperty('--text-primary', '#212121');
            document.documentElement.style.setProperty('--text-secondary', '#666666');
            document.documentElement.style.setProperty('--border-color', '#e0e0e0');
        }
        
        this.showNotification(enabled ? 'Modo oscuro activado' : 'Modo oscuro desactivado', 'success');
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