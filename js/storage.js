// storage.js - Gestión del almacenamiento local

class Storage {
    constructor() {
        this.initializeStorage();
    }

    // Obtener la clave de almacenamiento específica del usuario
    getUserStorageKey() {
        const userId = localStorage.getItem('user_id');
        const userPrefix = localStorage.getItem('current_user_prefix');
        if (!userId || !userPrefix) {
            window.location.href = 'welcome.html';
            return null;
        }
        return `${userPrefix}_data`;
    }

    // Inicializar almacenamiento si no existe
    initializeStorage() {
        const storageKey = this.getUserStorageKey();
        if (!storageKey) return;

        if (!localStorage.getItem(storageKey)) {
            const initialData = {
                transactions: [],
                categories: {
                    income: [
                        { id: 'salary', name: 'Salario', icon: '💰' },
                        { id: 'freelance', name: 'Trabajo Freelance', icon: '💻' },
                        { id: 'investment', name: 'Inversiones', icon: '📈' },
                        { id: 'other-income', name: 'Otros Ingresos', icon: '💵' }
                    ],
                    expense: [
                        { id: 'food', name: 'Comida', icon: '🍔' },
                        { id: 'transport', name: 'Transporte', icon: '🚗' },
                        { id: 'utilities', name: 'Servicios', icon: '💡' },
                        { id: 'entertainment', name: 'Entretenimiento', icon: '🎮' },
                        { id: 'shopping', name: 'Compras', icon: '🛍️' },
                        { id: 'health', name: 'Salud', icon: '🏥' },
                        { id: 'education', name: 'Educación', icon: '📚' },
                        { id: 'other-expense', name: 'Otros Gastos', icon: '📌' }
                    ]
                }
            };
            this.saveData(initialData);
        }
    }

    // Guardar datos
    saveData(data) {
        const storageKey = this.getUserStorageKey();
        if (!storageKey) return false;
        try {
            localStorage.setItem(storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error al guardar datos:', error);
            return false;
        }
    }

    // Obtener datos
    getData() {
        const storageKey = this.getUserStorageKey();
        if (!storageKey) return null;
        try {
            const data = localStorage.getItem(storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al obtener datos:', error);
            return null;
        }
    }

    // Agregar transacción
    addTransaction(transaction) {
        const data = this.getData();
        if (!data) return false;

        // Generar ID único para la transacción
        transaction.id = Date.now().toString();
        
        // Agregar la transacción al inicio del array
        data.transactions.unshift(transaction);
        
        return this.saveData(data);
    }

    // Eliminar transacción
    deleteTransaction(transactionId) {
        const data = this.getData();
        if (!data) return false;

        const index = data.transactions.findIndex(t => t.id === transactionId);
        if (index === -1) return false;

        data.transactions.splice(index, 1);
        return this.saveData(data);
    }

    // Obtener transacciones filtradas
    getFilteredTransactions(type = 'all', month = 'all') {
        const data = this.getData();
        if (!data) return [];

        let transactions = data.transactions;

        // Filtrar por tipo
        if (type !== 'all') {
            transactions = transactions.filter(t => t.type === type);
        }

        // Filtrar por mes
        if (month !== 'all') {
            transactions = transactions.filter(t => t.date.startsWith(month));
        }

        return transactions;
    }

    // Agregar categoría
    addCategory(type, category) {
        const data = this.getData();
        if (!data) return false;

        // Verificar si la categoría ya existe
        const exists = data.categories[type].some(cat => 
            cat.id === category.id || cat.name.toLowerCase() === category.name.toLowerCase()
        );

        if (exists) return false;

        data.categories[type].push(category);
        return this.saveData(data);
    }

    // Eliminar categoría
    deleteCategory(type, categoryId) {
        const data = this.getData();
        if (!data) return false;

        const index = data.categories[type].findIndex(cat => cat.id === categoryId);
        if (index === -1) return false;

        // Eliminar la categoría
        data.categories[type].splice(index, 1);

        // Actualizar transacciones que usaban esta categoría
        data.transactions = data.transactions.map(transaction => {
            if (transaction.category === categoryId) {
                transaction.category = 'other-' + type;
            }
            return transaction;
        });

        return this.saveData(data);
    }

    // Obtener estadísticas por categoría
    getCategoryStats(type = 'expense', month = 'all') {
        let transactions = this.getFilteredTransactions(type, month);
        const categoryStats = {};
        
        transactions.forEach(transaction => {
            if (!categoryStats[transaction.category]) {
                categoryStats[transaction.category] = 0;
            }
            categoryStats[transaction.category] += parseFloat(transaction.amount);
        });
        
        return categoryStats;
    }

    // Obtener balance total
    getBalance() {
        const data = this.getData();
        if (!data) return { income: 0, expense: 0, total: 0 };

        const balance = {
            income: 0,
            expense: 0,
            total: 0
        };

        data.transactions.forEach(transaction => {
            const amount = parseFloat(transaction.amount);
            if (transaction.type === 'income') {
                balance.income += amount;
            } else {
                balance.expense += amount;
            }
        });

        balance.total = balance.income - balance.expense;
        return balance;
    }

    // Obtener información de categoría
    getCategoryInfo(categoryId) {
        const data = this.getData();
        if (!data) return null;
        
        const allCategories = [...data.categories.income, ...data.categories.expense];
        return allCategories.find(cat => cat.id === categoryId);
    }

    // Obtener todas las transacciones
    getTransactions() {
        const data = this.getData();
        return data ? data.transactions : [];
    }

    // Obtener estadísticas mensuales
    getMonthlyStats(year) {
        const transactions = this.getTransactions();
        const monthlyStats = {};
        
        // Inicializar todos los meses
        for (let i = 1; i <= 12; i++) {
            const month = i.toString().padStart(2, '0');
            monthlyStats[`${year}-${month}`] = {
                income: 0,
                expense: 0
            };
        }
        
        // Calcular totales por mes
        transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            const transactionYear = transactionDate.getFullYear();
            
            if (transactionYear === year) {
                const month = transactionDate.toISOString().slice(0, 7);
                if (transaction.type === 'income') {
                    monthlyStats[month].income += parseFloat(transaction.amount);
                } else {
                    monthlyStats[month].expense += parseFloat(transaction.amount);
                }
            }
        });
        
        return monthlyStats;
    }

    // Obtener meses disponibles
    getAvailableMonths() {
        const transactions = this.getTransactions();
        const months = new Set();
        
        transactions.forEach(transaction => {
            const month = new Date(transaction.date).toISOString().slice(0, 7);
            months.add(month);
        });
        
        return Array.from(months).sort().reverse();
    }

    // Exportar datos
    exportData() {
        const data = this.getData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `gastos_ingresos_${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Importar datos
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    // Validar estructura básica
                    if (data.transactions && Array.isArray(data.transactions)) {
                        this.saveData(data);
                        resolve(true);
                    } else {
                        reject('Formato de archivo inválido');
                    }
                } catch (error) {
                    reject('Error al leer el archivo');
                }
            };
            
            reader.readAsText(file);
        });
    }

    // Limpiar todos los datos
    clearAllData() {
        if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
            this.initializeStorage();
            return true;
        }
        return false;
    }
}

// Crear instancia global
const storage = new Storage();
