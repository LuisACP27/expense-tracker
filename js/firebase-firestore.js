// firebase-firestore.js - Gestión de base de datos en la nube con Firestore

class FirestoreManager {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.syncInProgress = false;
        this.offlineQueue = [];
        this.initializeFirestore();
    }

    // Inicializar Firestore
    async initializeFirestore() {
        try {
            // Verificar si Firebase está inicializado
            if (!firebase.apps.length) {
                console.error('Firebase no está inicializado');
                return;
            }

            this.db = firebase.firestore();
            this.auth = firebase.auth();

            // Habilitar persistencia offline
            await this.db.enablePersistence()
                .catch(err => {
                    if (err.code === 'failed-precondition') {
                        console.warn('Persistencia offline no disponible: múltiples tabs abiertas');
                    } else if (err.code === 'unimplemented') {
                        console.warn('Persistencia offline no soportada en este navegador');
                    }
                });

            // Configurar listener de autenticación
            this.auth.onAuthStateChanged(user => {
                this.currentUser = user;
                if (user) {
                    this.syncLocalToCloud();
                }
            });

            // Detectar cambios de conectividad
            window.addEventListener('online', () => {
                console.log('Conexión restaurada - sincronizando...');
                this.syncLocalToCloud();
            });

        } catch (error) {
            console.error('Error inicializando Firestore:', error);
        }
    }

    // Obtener referencia a la colección del usuario
    getUserCollection(collection) {
        if (!this.currentUser) return null;
        return this.db.collection('users').doc(this.currentUser.uid).collection(collection);
    }

    // Guardar transacción
    async saveTransaction(transaction) {
        if (!this.currentUser) return null;

        try {
            const transactionsRef = this.getUserCollection('transactions');
            
            // Agregar metadata
            transaction.userId = this.currentUser.uid;
            transaction.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            transaction.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

            // Si estamos offline, agregar a la cola
            if (!navigator.onLine) {
                this.offlineQueue.push({
                    type: 'add',
                    collection: 'transactions',
                    data: transaction
                });
                // Guardar también en localStorage como respaldo
                this.saveToLocalStorage(transaction);
            }

            // Intentar guardar en Firestore
            const docRef = await transactionsRef.add(transaction);
            return docRef.id;

        } catch (error) {
            console.error('Error guardando transacción:', error);
            // Si falla, guardar en localStorage
            this.saveToLocalStorage(transaction);
            return null;
        }
    }

    // Obtener transacciones
    async getTransactions(filters = {}) {
        if (!this.currentUser) return [];

        try {
            let query = this.getUserCollection('transactions');

            // Aplicar filtros
            if (filters.type && filters.type !== 'all') {
                query = query.where('type', '==', filters.type);
            }

            if (filters.month && filters.month !== 'all') {
                const startDate = new Date(filters.month + '-01');
                const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
                query = query.where('date', '>=', startDate.toISOString())
                           .where('date', '<=', endDate.toISOString());
            }

            // Ordenar por fecha descendente
            query = query.orderBy('date', 'desc').limit(100);

            const snapshot = await query.get();
            const transactions = [];

            snapshot.forEach(doc => {
                transactions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return transactions;

        } catch (error) {
            console.error('Error obteniendo transacciones:', error);
            // Si falla, obtener de localStorage
            return this.getFromLocalStorage('transactions') || [];
        }
    }

    // Eliminar transacción
    async deleteTransaction(transactionId) {
        if (!this.currentUser) return false;

        try {
            await this.getUserCollection('transactions').doc(transactionId).delete();
            return true;
        } catch (error) {
            console.error('Error eliminando transacción:', error);
            // Si estamos offline, agregar a la cola
            if (!navigator.onLine) {
                this.offlineQueue.push({
                    type: 'delete',
                    collection: 'transactions',
                    id: transactionId
                });
            }
            return false;
        }
    }

    // Guardar categorías
    async saveCategories(categories) {
        if (!this.currentUser) return false;

        try {
            const userDoc = this.db.collection('users').doc(this.currentUser.uid);
            await userDoc.set({
                categories: categories,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            return true;
        } catch (error) {
            console.error('Error guardando categorías:', error);
            this.saveToLocalStorage({ categories });
            return false;
        }
    }

    // Obtener categorías
    async getCategories() {
        if (!this.currentUser) return null;

        try {
            const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
            
            if (userDoc.exists && userDoc.data().categories) {
                return userDoc.data().categories;
            }

            // Si no existen, retornar categorías por defecto
            return this.getDefaultCategories();

        } catch (error) {
            console.error('Error obteniendo categorías:', error);
            return this.getFromLocalStorage('categories') || this.getDefaultCategories();
        }
    }

    // Sincronizar datos locales con la nube
    async syncLocalToCloud() {
        if (!this.currentUser || this.syncInProgress || !navigator.onLine) return;

        this.syncInProgress = true;
        console.log('Iniciando sincronización con la nube...');

        try {
            // Obtener datos locales
            const localData = this.getLocalData();
            
            if (localData && localData.transactions) {
                // Sincronizar transacciones no sincronizadas
                for (const transaction of localData.transactions) {
                    if (!transaction.synced) {
                        await this.saveTransaction(transaction);
                    }
                }
            }

            // Procesar cola offline
            while (this.offlineQueue.length > 0) {
                const operation = this.offlineQueue.shift();
                await this.processOfflineOperation(operation);
            }

            console.log('Sincronización completada');

        } catch (error) {
            console.error('Error en sincronización:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    // Procesar operación offline
    async processOfflineOperation(operation) {
        switch (operation.type) {
            case 'add':
                await this.saveTransaction(operation.data);
                break;
            case 'delete':
                await this.deleteTransaction(operation.id);
                break;
            case 'update':
                await this.updateTransaction(operation.id, operation.data);
                break;
        }
    }

    // Configurar listeners en tiempo real
    setupRealtimeListeners(callbacks) {
        if (!this.currentUser) return;

        // Listener para transacciones
        this.getUserCollection('transactions')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                const changes = [];
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        changes.push({
                            type: 'added',
                            data: { id: change.doc.id, ...change.doc.data() }
                        });
                    }
                    if (change.type === 'modified') {
                        changes.push({
                            type: 'modified',
                            data: { id: change.doc.id, ...change.doc.data() }
                        });
                    }
                    if (change.type === 'removed') {
                        changes.push({
                            type: 'removed',
                            id: change.doc.id
                        });
                    }
                });

                if (callbacks.onTransactionsChange && changes.length > 0) {
                    callbacks.onTransactionsChange(changes);
                }
            });
    }

    // Obtener estadísticas
    async getStatistics(year) {
        if (!this.currentUser) return null;

        try {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);

            const snapshot = await this.getUserCollection('transactions')
                .where('date', '>=', startDate.toISOString())
                .where('date', '<=', endDate.toISOString())
                .get();

            const stats = {
                monthlyTotals: {},
                categoryTotals: {},
                totalIncome: 0,
                totalExpense: 0
            };

            snapshot.forEach(doc => {
                const transaction = doc.data();
                const month = new Date(transaction.date).getMonth();
                const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

                // Inicializar mes si no existe
                if (!stats.monthlyTotals[monthKey]) {
                    stats.monthlyTotals[monthKey] = { income: 0, expense: 0 };
                }

                // Actualizar totales
                if (transaction.type === 'income') {
                    stats.monthlyTotals[monthKey].income += transaction.amount;
                    stats.totalIncome += transaction.amount;
                } else {
                    stats.monthlyTotals[monthKey].expense += transaction.amount;
                    stats.totalExpense += transaction.amount;
                    
                    // Totales por categoría
                    if (!stats.categoryTotals[transaction.category]) {
                        stats.categoryTotals[transaction.category] = 0;
                    }
                    stats.categoryTotals[transaction.category] += transaction.amount;
                }
            });

            return stats;

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return null;
        }
    }

    // Utilidades de localStorage (respaldo)
    saveToLocalStorage(data) {
        const userPrefix = `user_${this.currentUser?.uid || 'temp'}`;
        const existingData = JSON.parse(localStorage.getItem(`${userPrefix}_firestore_backup`) || '{}');
        const updatedData = { ...existingData, ...data, lastSync: new Date().toISOString() };
        localStorage.setItem(`${userPrefix}_firestore_backup`, JSON.stringify(updatedData));
    }

    getFromLocalStorage(key) {
        const userPrefix = `user_${this.currentUser?.uid || 'temp'}`;
        const data = JSON.parse(localStorage.getItem(`${userPrefix}_firestore_backup`) || '{}');
        return data[key];
    }

    getLocalData() {
        const userPrefix = `user_${this.currentUser?.uid || 'temp'}`;
        return JSON.parse(localStorage.getItem(`${userPrefix}_expense_tracker_data`) || '{}');
    }

    // Categorías por defecto
    getDefaultCategories() {
        return {
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
        };
    }
}

// Crear instancia global
const firestoreManager = new FirestoreManager(); 