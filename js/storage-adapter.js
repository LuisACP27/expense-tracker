// storage-adapter.js - Adaptador unificado para localStorage y Firestore

class StorageAdapter {
    constructor() {
        this.localStorage = typeof storage !== 'undefined' ? storage : null;
        this.firestore = typeof firestoreManager !== 'undefined' ? firestoreManager : null;
        this.useCloudStorage = false;
        this.syncEnabled = true;
        this.lastSyncTime = null;
        this.syncInterval = 30000; // 30 segundos
        this.initializeAdapter();
    }

    // Inicializar el adaptador
    async initializeAdapter() {
        // Verificar si hay usuario autenticado
        if (firebase && firebase.auth) {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    this.useCloudStorage = true;
                    await this.migrateDataToCloud();
                    this.startPeriodicSync();
                } else {
                    this.useCloudStorage = false;
                }
            });
        }

        // Escuchar cambios de conectividad
        window.addEventListener('online', () => {
            if (this.useCloudStorage) {
                this.syncData();
            }
        });
    }

    // Migrar datos locales a la nube (primera vez)
    async migrateDataToCloud() {
        if (!this.localStorage || !this.firestore) return;

        const localData = this.localStorage.getData();
        if (!localData || localData.migrated) return;

        console.log('Migrando datos locales a Firestore...');

        try {
            // Migrar categorías
            if (localData.categories) {
                await this.firestore.saveCategories(localData.categories);
            }

            // Migrar transacciones
            if (localData.transactions && localData.transactions.length > 0) {
                for (const transaction of localData.transactions) {
                    // Eliminar el ID local y dejar que Firestore genere uno nuevo
                    const { id, ...transactionData } = transaction;
                    await this.firestore.saveTransaction(transactionData);
                }
            }

            // Marcar como migrado
            localData.migrated = true;
            this.localStorage.saveData(localData);

            console.log('Migración completada');
        } catch (error) {
            console.error('Error durante la migración:', error);
        }
    }

    // Obtener todas las transacciones
    async getTransactions(filters = {}) {
        if (this.useCloudStorage && this.firestore) {
            return await this.firestore.getTransactions(filters);
        } else if (this.localStorage) {
            return this.localStorage.getFilteredTransactions(filters.type, filters.month);
        }
        return [];
    }

    // Agregar transacción
    async addTransaction(transaction) {
        if (this.useCloudStorage && this.firestore) {
            const id = await this.firestore.saveTransaction(transaction);
            if (id) {
                // También guardar en local como backup
                transaction.id = id;
                transaction.synced = true;
                this.localStorage?.addTransaction(transaction);
                return transaction;
            }
        }
        
        // Si no hay conexión o falla Firestore, usar localStorage
        if (this.localStorage) {
            transaction.synced = false;
            return this.localStorage.addTransaction(transaction);
        }
        
        return null;
    }

    // Eliminar transacción
    async deleteTransaction(id) {
        let success = false;

        if (this.useCloudStorage && this.firestore) {
            success = await this.firestore.deleteTransaction(id);
        }

        // También eliminar de localStorage
        if (this.localStorage) {
            this.localStorage.deleteTransaction(id);
        }

        return success;
    }

    // Obtener categorías
    async getCategories() {
        if (this.useCloudStorage && this.firestore) {
            const categories = await this.firestore.getCategories();
            if (categories) {
                // Guardar en localStorage como cache
                const data = this.localStorage?.getData() || {};
                data.categories = categories;
                this.localStorage?.saveData(data);
                return categories;
            }
        }

        // Si no hay conexión, usar localStorage
        if (this.localStorage) {
            const data = this.localStorage.getData();
            return data?.categories || null;
        }

        return null;
    }

    // Agregar categoría
    async addCategory(type, category) {
        let success = false;

        // Primero agregar a localStorage
        if (this.localStorage) {
            success = this.localStorage.addCategory(type, category);
        }

        // Luego sincronizar con Firestore
        if (this.useCloudStorage && this.firestore && success) {
            const categories = await this.getCategories();
            await this.firestore.saveCategories(categories);
        }

        return success;
    }

    // Eliminar categoría
    async deleteCategory(type, categoryId) {
        let success = false;

        // Primero eliminar de localStorage
        if (this.localStorage) {
            success = this.localStorage.deleteCategory(type, categoryId);
        }

        // Luego sincronizar con Firestore
        if (this.useCloudStorage && this.firestore && success) {
            const categories = await this.getCategories();
            await this.firestore.saveCategories(categories);
        }

        return success;
    }

    // Calcular totales
    async calculateTotals() {
        const transactions = await this.getTransactions();
        const totals = {
            income: 0,
            expense: 0,
            balance: 0
        };

        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totals.income += parseFloat(transaction.amount);
            } else {
                totals.expense += parseFloat(transaction.amount);
            }
        });

        totals.balance = totals.income - totals.expense;
        return totals;
    }

    // Obtener estadísticas por categoría
    async getCategoryStats(type = 'expense', month = 'all') {
        const transactions = await this.getTransactions({ type, month });
        const categoryStats = {};

        transactions.forEach(transaction => {
            if (!categoryStats[transaction.category]) {
                categoryStats[transaction.category] = 0;
            }
            categoryStats[transaction.category] += parseFloat(transaction.amount);
        });

        return categoryStats;
    }

    // Obtener estadísticas mensuales
    async getMonthlyStats(year) {
        if (this.useCloudStorage && this.firestore) {
            const stats = await this.firestore.getStatistics(year);
            if (stats) return stats.monthlyTotals;
        }

        // Calcular desde transacciones locales
        const transactions = await this.getTransactions();
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
    async getAvailableMonths() {
        const transactions = await this.getTransactions();
        const months = new Set();

        transactions.forEach(transaction => {
            const month = new Date(transaction.date).toISOString().slice(0, 7);
            months.add(month);
        });

        return Array.from(months).sort().reverse();
    }

    // Obtener información de categoría
    async getCategoryInfo(categoryId) {
        const categories = await this.getCategories();
        if (!categories) return null;

        const allCategories = [...(categories.income || []), ...(categories.expense || [])];
        return allCategories.find(cat => cat.id === categoryId);
    }

    // Sincronizar datos
    async syncData() {
        if (!this.useCloudStorage || !this.firestore || !navigator.onLine) return;

        console.log('Sincronizando datos...');

        try {
            // Obtener transacciones no sincronizadas
            if (this.localStorage) {
                const localData = this.localStorage.getData();
                if (localData && localData.transactions) {
                    for (const transaction of localData.transactions) {
                        if (!transaction.synced) {
                            const { id, synced, ...transactionData } = transaction;
                            const newId = await this.firestore.saveTransaction(transactionData);
                            if (newId) {
                                // Marcar como sincronizada
                                transaction.synced = true;
                                transaction.cloudId = newId;
                            }
                        }
                    }
                    this.localStorage.saveData(localData);
                }
            }

            this.lastSyncTime = new Date();
            console.log('Sincronización completada');
        } catch (error) {
            console.error('Error durante la sincronización:', error);
        }
    }

    // Iniciar sincronización periódica
    startPeriodicSync() {
        if (this.syncInterval) {
            setInterval(() => {
                if (this.syncEnabled) {
                    this.syncData();
                }
            }, this.syncInterval);
        }
    }

    // Configurar listeners en tiempo real
    setupRealtimeListeners(callbacks) {
        if (this.useCloudStorage && this.firestore) {
            this.firestore.setupRealtimeListeners(callbacks);
        }
    }

    // Exportar datos
    async exportData() {
        const transactions = await this.getTransactions();
        const categories = await this.getCategories();

        const data = {
            transactions,
            categories,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `gastos_ingresos_${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Importar datos
    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // Validar estructura básica
                    if (!data.transactions || !Array.isArray(data.transactions)) {
                        reject('Formato de archivo inválido');
                        return;
                    }

                    // Importar categorías si existen
                    if (data.categories) {
                        if (this.useCloudStorage && this.firestore) {
                            await this.firestore.saveCategories(data.categories);
                        } else if (this.localStorage) {
                            const localData = this.localStorage.getData();
                            localData.categories = data.categories;
                            this.localStorage.saveData(localData);
                        }
                    }

                    // Importar transacciones
                    for (const transaction of data.transactions) {
                        const { id, ...transactionData } = transaction;
                        await this.addTransaction(transactionData);
                    }

                    resolve(true);
                } catch (error) {
                    reject('Error al leer el archivo: ' + error.message);
                }
            };

            reader.readAsText(file);
        });
    }

    // Limpiar todos los datos
    async clearAllData() {
        if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
            // Limpiar Firestore si está disponible
            if (this.useCloudStorage && this.firestore) {
                const transactions = await this.getTransactions();
                for (const transaction of transactions) {
                    await this.firestore.deleteTransaction(transaction.id);
                }
            }

            // Limpiar localStorage
            if (this.localStorage) {
                this.localStorage.clearAllData();
            }

            return true;
        }
        return false;
    }

    // Obtener estado de sincronización
    getSyncStatus() {
        return {
            cloudEnabled: this.useCloudStorage,
            lastSync: this.lastSyncTime,
            online: navigator.onLine
        };
    }
}

// Crear instancia global del adaptador
const storageAdapter = new StorageAdapter(); 