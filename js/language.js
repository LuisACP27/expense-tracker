// Traducciones para todas las páginas
const translations = {
    'es': {
        // Página de bienvenida
        welcomeTitle: 'Mi Gestor Financiero',
        welcomeSubtitle: 'Controla tus finanzas de manera fácil y segura',
        login: 'Iniciar Sesión',
        register: 'Registrarse',
        selectLanguage: 'Selecciona tu idioma:',
        
        // Página de PIN
        enterPin: 'Ingresa tu PIN',
        enterPinDesc: 'Introduce el PIN de 4 dígitos para acceder',
        welcomeBack: 'Bienvenido de nuevo,',
        pinError: 'PIN incorrecto. Intenta de nuevo.',
        notYourAccount: '¿No es tu cuenta?',
        access: 'Acceder',
        
        // Página de ajustes
        settings: 'Ajustes',
        appearance: 'Apariencia',
        theme: 'Tema',
        language: 'Idioma',
        security: 'Seguridad',
        securityPin: 'PIN de seguridad',
        changeSecurityOptions: 'Cambiar opciones de seguridad',
        data: 'Datos',
        exportData: 'Exportar datos',
        importData: 'Importar datos',
        deleteData: 'Eliminar todos los datos',
        account: 'Cuenta',
        logout: 'Cerrar sesión',
        about: 'Acerca de',
        
        // Temas
        themeGreen: 'Verde (Predeterminado)',
        themeBlue: 'Azul',
        themePurple: 'Púrpura',
        themeRed: 'Rojo',
        themeOrange: 'Naranja',
        themeGray: 'Gris',

        
        // Mensajes
        confirmLogout: '¿Estás seguro de que quieres cerrar sesión?',
        confirmDelete: '¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.',
        dataExported: 'Datos exportados correctamente',
        dataImported: 'Datos importados correctamente',
        dataDeleted: 'Todos los datos han sido eliminados',
        languageChanged: 'Idioma cambiado a Español',
        pinEnabled: 'PIN habilitado',
        pinDisabled: 'PIN deshabilitado',
        
        // Página principal
        totalBalance: 'Balance Total',
        income: 'Ingresos',
        expense: 'Gastos',
        pullToRefresh: 'Desliza para actualizar',
        type: 'Tipo',
        amount: 'Cantidad',
        amountPlaceholder: '0.00',
        category: 'Categoría',
        selectCategory: 'Selecciona una categoría',
        description: 'Descripción',
        descriptionPlaceholder: 'Descripción opcional',
        date: 'Fecha',
        addTransaction: 'Agregar Transacción',
        manageCategories: 'Gestionar Categorías',
        incomeCategories: 'Ingresos',
        expenseCategories: 'Gastos',
        add: 'Agregar',
        close: 'Cerrar',
        all: 'Todas',
        onlyIncome: 'Solo Ingresos',
        onlyExpenses: 'Solo Gastos',
        allMonths: 'Todos los meses',
        expensesByCategory: 'Gastos por Categoría',
        monthlyTrend: 'Tendencia Mensual',
        currentMonthSummary: 'Resumen del Mes Actual',
        transactions: 'Transacciones',
        statistics: 'Estadísticas',
        exit: 'Salir',
        confirmAction: 'Confirmar acción',
        accept: 'Aceptar',
        cancel: 'Cancelar',
        continueWithGoogle: 'Continuar con Google',
        registerWithGoogle: 'Registrarse con Google',
        authError: 'Error de autenticación',
        newIncomeCategoryPlaceholder: 'Nueva categoría de ingreso',
        newExpenseCategoryPlaceholder: 'Nueva categoría de gasto',
        iconPlaceholder: 'Icono (ej. 💰)',
        scrollIndicator: 'Desliza para ver más',
        noTransactions: 'No hay transacciones',
        loading: 'Cargando...',
        processing: 'Procesando...',
        error: 'Error',
        success: 'Éxito',
        warning: 'Advertencia',
        info: 'Información'
    },
    'en': {
        welcomeTitle: 'My Financial Manager',
        welcomeSubtitle: 'Control your finances easily and securely',
        login: 'Login',
        register: 'Register',
        selectLanguage: 'Select your language:',
        
        enterPin: 'Enter your PIN',
        enterPinDesc: 'Enter the 4-digit PIN to access',
        welcomeBack: 'Welcome back,',
        pinError: 'Incorrect PIN. Try again.',
        notYourAccount: 'Not your account?',
        access: 'Access',
        
        settings: 'Settings',
        appearance: 'Appearance',
        theme: 'Theme',
        language: 'Language',
        security: 'Security',
        securityPin: 'Security PIN',
        changeSecurityOptions: 'Change security options',
        data: 'Data',
        exportData: 'Export data',
        importData: 'Import data',
        deleteData: 'Delete all data',
        account: 'Account',
        logout: 'Logout',
        about: 'About',
        
        themeGreen: 'Green (Default)',
        themeBlue: 'Blue',
        themePurple: 'Purple',
        themeRed: 'Red',
        themeOrange: 'Orange',
        themeGray: 'Gray',

        
        confirmLogout: 'Are you sure you want to logout?',
        confirmDelete: 'Are you sure you want to delete all data? This action cannot be undone.',
        dataExported: 'Data exported successfully',
        dataImported: 'Data imported successfully',
        dataDeleted: 'All data has been deleted',
        languageChanged: 'Language changed to English',
        pinEnabled: 'PIN enabled',
        pinDisabled: 'PIN disabled',
        
        totalBalance: 'Total Balance',
        income: 'Income',
        expense: 'Expenses',
        pullToRefresh: 'Pull to refresh',
        type: 'Type',
        amount: 'Amount',
        amountPlaceholder: '0.00',
        category: 'Category',
        selectCategory: 'Select a category',
        description: 'Description',
        descriptionPlaceholder: 'Description optional',
        date: 'Date',
        addTransaction: 'Add Transaction',
        manageCategories: 'Manage Categories',
        incomeCategories: 'Income',
        expenseCategories: 'Expenses',
        add: 'Add',
        close: 'Close',
        all: 'All',
        onlyIncome: 'Income Only',
        onlyExpenses: 'Expenses Only',
        allMonths: 'All months',
        expensesByCategory: 'Expenses by Category',
        monthlyTrend: 'Monthly Trend',
        currentMonthSummary: 'Current Month Summary',
        transactions: 'Transactions',
        statistics: 'Statistics',
        exit: 'Exit',
        confirmAction: 'Confirm action',
        accept: 'Accept',
        cancel: 'Cancel',
        continueWithGoogle: 'Continue with Google',
        registerWithGoogle: 'Register with Google',
        authError: 'Authentication error',
        newIncomeCategoryPlaceholder: 'New income category',
        newExpenseCategoryPlaceholder: 'New expense category',
        iconPlaceholder: 'Icon (e.g. 💰)',
        scrollIndicator: 'Swipe to see more',
        noTransactions: 'No transactions',
        loading: 'Loading...',
        processing: 'Processing...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Info'
    },
    'pt': {
        welcomeTitle: 'Meu Gerenciador Financeiro',
        welcomeSubtitle: 'Controle suas finanças de forma fácil e segura',
        login: 'Entrar',
        register: 'Registrar',
        selectLanguage: 'Selecione seu idioma:',
        
        enterPin: 'Digite seu PIN',
        enterPinDesc: 'Digite o PIN de 4 dígitos para acessar',
        welcomeBack: 'Bem-vindo de volta,',
        pinError: 'PIN incorreto. Tente novamente.',
        notYourAccount: 'Não é sua conta?',
        access: 'Acessar',
        
        settings: 'Configurações',
        appearance: 'Aparência',
        theme: 'Tema',
        language: 'Idioma',
        security: 'Segurança',
        securityPin: 'PIN de segurança',
        changeSecurityOptions: 'Alterar opções de segurança',
        data: 'Dados',
        exportData: 'Exportar dados',
        importData: 'Importar dados',
        deleteData: 'Excluir todos os dados',
        account: 'Conta',
        logout: 'Sair',
        about: 'Sobre',
        
        themeGreen: 'Verde (Padrão)',
        themeBlue: 'Azul',
        themePurple: 'Roxo',
        themeRed: 'Vermelho',
        themeOrange: 'Laranja',
        themeGray: 'Cinza',

        
        confirmLogout: 'Tem certeza que deseja sair?',
        confirmDelete: 'Tem certeza que deseja excluir todos os dados? Esta ação não pode ser desfeita.',
        dataExported: 'Dados exportados com sucesso',
        dataImported: 'Dados importados com sucesso',
        dataDeleted: 'Todos os dados foram excluídos',
        languageChanged: 'Idioma alterado para Português',
        pinEnabled: 'PIN ativado',
        pinDisabled: 'PIN desativado',
        
        totalBalance: 'Saldo Total',
        income: 'Receitas',
        expense: 'Despesas',
        pullToRefresh: 'Puxe para atualizar',
        type: 'Tipo',
        amount: 'Valor',
        amountPlaceholder: '0.00',
        category: 'Categoria',
        selectCategory: 'Selecione uma categoria',
        description: 'Descrição',
        descriptionPlaceholder: 'Descrição opcional',
        date: 'Data',
        addTransaction: 'Adicionar Transação',
        manageCategories: 'Gerenciar Categorias',
        incomeCategories: 'Receitas',
        expenseCategories: 'Despesas',
        add: 'Adicionar',
        close: 'Fechar',
        all: 'Todas',
        onlyIncome: 'Apenas Receitas',
        onlyExpenses: 'Apenas Despesas',
        allMonths: 'Todos os meses',
        expensesByCategory: 'Despesas por Categoria',
        monthlyTrend: 'Tendência Mensal',
        currentMonthSummary: 'Resumo do Mês Atual',
        transactions: 'Transações',
        statistics: 'Estatísticas',
        exit: 'Sair',
        confirmAction: 'Confirmar ação',
        accept: 'Aceitar',
        cancel: 'Cancelar',
        continueWithGoogle: 'Continuar com Google',
        registerWithGoogle: 'Registrar com Google',
        authError: 'Erro de autenticação',
        newIncomeCategoryPlaceholder: 'Nova categoria de receita',
        newExpenseCategoryPlaceholder: 'Nova categoria de despesa',
        iconPlaceholder: 'Ícone (ex. 💰)',
        scrollIndicator: 'Deslize para ver mais',
        noTransactions: 'Não há transações',
        loading: 'Carregando...',
        processing: 'Processando...',
        error: 'Erro',
        success: 'Sucesso',
        warning: 'Aviso',
        info: 'Informação'
    },
    'fr': {
        welcomeTitle: 'Mon Gestionnaire Financier',
        welcomeSubtitle: 'Contrôlez vos finances facilement et en toute sécurité',
        login: 'Connexion',
        register: 'S\'inscrire',
        selectLanguage: 'Sélectionnez votre langue:',
        
        enterPin: 'Entrez votre PIN',
        enterPinDesc: 'Entrez le code PIN à 4 chiffres pour accéder',
        welcomeBack: 'Bon retour,',
        pinError: 'PIN incorrect. Réessayez.',
        notYourAccount: 'Ce n\'est pas votre compte?',
        access: 'Accéder',
        
        settings: 'Paramètres',
        appearance: 'Apparence',
        theme: 'Thème',
        language: 'Langue',
        security: 'Sécurité',
        securityPin: 'PIN de sécurité',
        changeSecurityOptions: 'Modifier les options de sécurité',
        data: 'Données',
        exportData: 'Exporter les données',
        importData: 'Importer les données',
        deleteData: 'Supprimer toutes les données',
        account: 'Compte',
        logout: 'Déconnexion',
        about: 'À propos',
        
        themeGreen: 'Vert (Par défaut)',
        themeBlue: 'Bleu',
        themePurple: 'Violet',
        themeRed: 'Rouge',
        themeOrange: 'Orange',
        themeGray: 'Gris',

        
        confirmLogout: 'Êtes-vous sûr de vouloir vous déconnecter?',
        confirmDelete: 'Êtes-vous sûr de vouloir supprimer toutes les données? Cette action ne peut pas être annulée.',
        dataExported: 'Données exportées avec succès',
        dataImported: 'Données importées avec succès',
        dataDeleted: 'Toutes les données ont été supprimées',
        languageChanged: 'Langue changée en Français',
        pinEnabled: 'PIN activé',
        pinDisabled: 'PIN désactivé',
        
        totalBalance: 'Solde Total',
        income: 'Revenus',
        expense: 'Dépenses',
        pullToRefresh: 'Tirez pour actualiser',
        type: 'Type',
        amount: 'Montant',
        amountPlaceholder: '0.00',
        category: 'Catégorie',
        selectCategory: 'Sélectionnez une catégorie',
        description: 'Description',
        descriptionPlaceholder: 'Description optionnelle',
        date: 'Date',
        addTransaction: 'Ajouter une Transaction',
        manageCategories: 'Gérer les Catégories',
        incomeCategories: 'Revenus',
        expenseCategories: 'Dépenses',
        add: 'Ajouter',
        close: 'Fermer',
        all: 'Toutes',
        onlyIncome: 'Revenus Uniquement',
        onlyExpenses: 'Dépenses Uniquement',
        allMonths: 'Tous les mois',
        expensesByCategory: 'Dépenses par Catégorie',
        monthlyTrend: 'Tendance Mensuelle',
        currentMonthSummary: 'Résumé du Mois en Cours',
        transactions: 'Transactions',
        statistics: 'Statistiques',
        exit: 'Quitter',
        confirmAction: 'Confirmer l\'action',
        accept: 'Accepter',
        cancel: 'Annuler',
        continueWithGoogle: 'Continuer avec Google',
        registerWithGoogle: 'S\'inscrire avec Google',
        authError: 'Erreur d\'authentification',
        newIncomeCategoryPlaceholder: 'Nouvelle catégorie de revenu',
        newExpenseCategoryPlaceholder: 'Nouvelle catégorie de dépense',
        iconPlaceholder: 'Icône (ex. 💰)',
        scrollIndicator: 'Frottez pour voir plus',
        noTransactions: 'Pas de transactions',
        loading: 'Chargement...',
        processing: 'En cours de traitement...',
        error: 'Erreur',
        success: 'Succès',
        warning: 'Avertissement',
        info: 'Information'
    }
};

// Función para obtener el idioma actual
function getCurrentLanguage() {
    // Si hay un usuario logueado, usar su idioma
    if (localStorage.getItem('user_id')) {
        const userPrefix = localStorage.getItem('current_user_prefix');
        return localStorage.getItem(`${userPrefix}_language`) || 'es';
    }
    // Si no hay usuario pero hay un idioma temporal en la sesión, usarlo
    if (sessionStorage.getItem('temp_language')) {
        return sessionStorage.getItem('temp_language');
    }
    // Si no hay usuario ni idioma temporal, usar español por defecto
    return 'es';
}

// Función para cambiar el idioma
function changeLanguage(lang) {
    // Si hay un usuario logueado, guardar el idioma en sus preferencias
    if (localStorage.getItem('user_id')) {
        const userPrefix = localStorage.getItem('current_user_prefix');
        localStorage.setItem(`${userPrefix}_language`, lang);
    } else {
        // Si no hay usuario, guardar el idioma temporalmente en la sesión
        sessionStorage.setItem('temp_language', lang);
    }
    
    // Actualizar el idioma del documento
    document.documentElement.lang = lang;
    
    // Disparar evento de cambio de idioma
    const event = new CustomEvent('languageChanged', { detail: { language: lang } });
    window.dispatchEvent(event);
    
    // Retornar las traducciones del idioma seleccionado
    return translations[lang] || translations['es'];
}

// Función para aplicar el idioma temporal al usuario después del login
function applyTempLanguage(userPrefix) {
    const tempLang = sessionStorage.getItem('temp_language');
    if (tempLang) {
        localStorage.setItem(`${userPrefix}_language`, tempLang);
        sessionStorage.removeItem('temp_language');
        
        // Disparar evento de cambio de idioma
        const event = new CustomEvent('languageChanged', { detail: { language: tempLang } });
        window.dispatchEvent(event);
    }
}

// Función para limpiar el idioma temporal al cerrar sesión
function clearTempLanguage() {
    sessionStorage.removeItem('temp_language');
}

// Función para obtener las traducciones del idioma actual
function getTranslations() {
    const currentLang = getCurrentLanguage();
    return translations[currentLang] || translations['es'];
}

// Exportar las funciones y constantes necesarias
window.appLanguage = {
    translations,
    getCurrentLanguage,
    changeLanguage,
    getTranslations,
    applyTempLanguage,
    clearTempLanguage
}; 