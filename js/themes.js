// Definición de temas disponibles
const themes = {
    green: {
        '--primary-color': '#4CAF50',
        '--primary-color-rgb': '76, 175, 80',
        '--secondary-color': '#53C5A8',
        '--background-color': '#f5f5f5',
        '--card-background': '#ffffff',
        '--border-color': '#e0e0e0',
        '--income-color': '#4CAF50',
        '--expense-color': '#f44336'
    },
    blue: {
        '--primary-color': '#2196F3',
        '--primary-color-rgb': '33, 150, 243',
        '--secondary-color': '#10d1c2',
        '--background-color': '#e3f2fd',
        '--card-background': '#ffffff',
        '--border-color': '#90caf9',
        '--income-color': '#2196F3',
        '--expense-color': '#f44336'
    },

    red: {
        '--primary-color': '#e53935',
        '--primary-color-rgb': '229, 57, 53',
        '--secondary-color': '#ff7043',
        '--background-color': '#fff5f5',
        '--card-background': '#fff',
        '--border-color': '#ffcdd2',
        '--income-color': '#e53935',
        '--expense-color': '#b71c1c'
    },
    purple: {
        '--primary-color': '#8e24aa',
        '--primary-color-rgb': '142, 36, 170',
        '--secondary-color': '#d82ccd',
        '--background-color': '#f3e5f5',
        '--card-background': '#fff',
        '--border-color': '#ce93d8',
        '--income-color': '#8e24aa',
        '--expense-color': '#d500f9'
    },
    orange: {
        '--primary-color': '#fb8c00',
        '--primary-color-rgb': '251, 140, 0',
        '--secondary-color': '#ffb300',
        '--background-color': '#fff3e0',
        '--card-background': '#fff',
        '--border-color': '#ffe0b2',
        '--income-color': '#fb8c00',
        '--expense-color': '#e65100'
    },
    gray: {
        '--primary-color': '#757575',
        '--primary-color-rgb': '117, 117, 117',
        '--secondary-color': '#bdbdbd',
        '--background-color': '#f5f5f5',
        '--card-background': '#fff',
        '--border-color': '#e0e0e0',
        '--income-color': '#757575',
        '--expense-color': '#bdbdbd'
    }
};

// Función para obtener el tema actual
function getCurrentTheme() {
    // Si hay un usuario logueado, usar su tema
    if (localStorage.getItem('user_id')) {
        const userPrefix = localStorage.getItem('current_user_prefix');
        return localStorage.getItem(`${userPrefix}_theme`) || 'green';
    }
    // Si no hay usuario, usar verde por defecto
    return 'green';
}

// Función para cambiar el tema
function changeTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return false;
    
    // Si hay un usuario logueado, guardar el tema en sus preferencias
    if (localStorage.getItem('user_id')) {
        const userPrefix = localStorage.getItem('current_user_prefix');
        localStorage.setItem(`${userPrefix}_theme`, themeName);
    }
    
    // Aplicar el tema
    Object.keys(theme).forEach(key => {
        document.documentElement.style.setProperty(key, theme[key]);
    });
    
    // Actualizar meta theme-color
    document.body.classList.remove('night-mode');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', theme['--primary-color']);
    
    return true;
}

// Función para aplicar el tema actual
function applyCurrentTheme() {
    const currentTheme = getCurrentTheme();
    return changeTheme(currentTheme);
}

// Exportar las funciones y constantes necesarias
window.appTheme = {
    themes,
    getCurrentTheme,
    changeTheme,
    applyCurrentTheme
}; 