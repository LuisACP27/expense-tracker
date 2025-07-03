// app.js - Lógica principal de la aplicación

class ExpenseTracker {
    constructor() {
        this.currentTab = 'add';
        this.storage = typeof storageAdapter !== 'undefined' ? storageAdapter : storage;
        this.init();
    }

    async init() {
        // Establecer fecha actual en el formulario
        this.setCurrentDate();
        
        // Cargar datos iniciales
        await this.updateBalance();
        await this.loadTransactions();
        await this.loadMonthFilter();

        // Renderizar categorías dinámicamente
        await this.renderCategories();
        // Asegurar que se muestren las categorías correctas según el tipo seleccionado
        await this.updateCategoryOptions();

        // Configurar event listeners
        this.setupEventListeners();
        
        // Inicializar gráficos cuando se abra la pestaña de estadísticas
        this.initChartsOnFirstView = true;

        this.setupSwipeGestures();
        
        // Configurar listeners en tiempo real si está disponible
        if (this.storage.setupRealtimeListeners) {
            this.storage.setupRealtimeListeners({
                onTransactionsChange: (changes) => {
                    this.handleRealtimeChanges(changes);
                }
            });
        }
        
        // Mostrar estado de sincronización
        this.updateSyncStatus();
    }

    setupEventListeners() {
        // Formulario de transacción
        const form = document.getElementById('transaction-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTransaction();
            });
        }

        // Cambio de tipo de transacción
        document.querySelectorAll('input[name="type"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateCategoryOptions());
        });

        // Botón para abrir modal de gestión de categorías
        const manageBtn = document.getElementById('manage-categories-btn');
        if (manageBtn) {
            manageBtn.addEventListener('click', () => this.openCategoryModal());
        }

        // Botón para cerrar modal de gestión de categorías
        const closeBtn = document.getElementById('close-category-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCategoryModal());
        }

        // Botones para agregar categorías
        const addIncomeBtn = document.getElementById('add-income-category-btn');
        const addExpenseBtn = document.getElementById('add-expense-category-btn');
        if (addIncomeBtn) {
            addIncomeBtn.addEventListener('click', () => this.addCategory('income'));
        }
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => this.addCategory('expense'));
        }

        // Delegación de eventos para eliminar categorías
        const incomeList = document.getElementById('income-category-list');
        const expenseList = document.getElementById('expense-category-list');
        if (incomeList) {
            incomeList.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-category-btn')) {
                    const categoryId = e.target.dataset.id;
                    this.deleteCategory('income', categoryId);
                }
            });
        }
        if (expenseList) {
            expenseList.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-category-btn')) {
                    const categoryId = e.target.dataset.id;
                    this.deleteCategory('expense', categoryId);
                }
            });
        }

        // Filtros
        const filterType = document.getElementById('filter-type');
        const filterMonth = document.getElementById('filter-month');
        if (filterType) {
            filterType.addEventListener('change', () => this.loadTransactions());
        }
        if (filterMonth) {
            filterMonth.addEventListener('change', () => this.loadTransactions());
        }

        // Delegación de eventos para botones de eliminar transacciones
        const transactionsList = document.getElementById('transactions-list');
        if (transactionsList) {
            transactionsList.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-btn')) {
                    const transactionId = e.target.dataset.id;
                    this.deleteTransaction(transactionId);
                }
            });
        }

        // El selector de categoría ahora funciona como select normal
        // No necesitamos eventos especiales

        // Pull to refresh
        this.setupPullToRefresh();
        
        // Configurar navegación con el menú inferior
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            if (item.dataset.tab) {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabName = item.dataset.tab;
                    this.switchTab(tabName);
                });
            }
        });
    }

    setupSwipeGestures() {
        const container = document.querySelector('.container');
        let touchStartX = 0;
        let touchEndX = 0;
        const minSwipeDistance = 50; // Mínima distancia para considerar un swipe

        container.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        container.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, false);

        this.handleSwipe = () => {
            const swipeDistance = touchEndX - touchStartX;
            if (Math.abs(swipeDistance) < minSwipeDistance) return;

            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            const currentTab = document.querySelector('.tab-btn.active');
            const currentIndex = tabs.indexOf(currentTab);

            if (swipeDistance > 0 && currentIndex > 0) {
                // Swipe derecha - tab anterior
                tabs[currentIndex - 1].click();
                this.vibrateDevice('short');
            } else if (swipeDistance < 0 && currentIndex < tabs.length - 1) {
                // Swipe izquierda - siguiente tab
                tabs[currentIndex + 1].click();
                this.vibrateDevice('short');
            }
        };
    }

    vibrateDevice(pattern = 'short') {
        if (!('vibrate' in navigator)) return;
        
        const patterns = {
            short: 50,
            medium: 100,
            long: 200,
            error: [50, 100, 50],
            success: [50, 50, 50]
        };
        
        navigator.vibrate(patterns[pattern]);
    }

    // Cambiar pestaña
    switchTab(tabName) {
        // Actualizar botones del menú inferior
        document.querySelectorAll('.bottom-nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Actualizar contenido de pestañas
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });

        this.currentTab = tabName;

        // Inicializar gráficos la primera vez que se abre la pestaña de estadísticas
        if (tabName === 'stats' && this.initChartsOnFirstView) {
            setTimeout(() => {
                chartManager.initCharts();
                chartManager.updateAllCharts();
                this.initChartsOnFirstView = false;
            }, 100);
        } else if (tabName === 'stats') {
            chartManager.updateAllCharts();
        }
    }

    // Establecer fecha actual
    setCurrentDate() {
        const dateInput = document.getElementById('date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.max = today;
    }

    // Actualizar opciones de categoría según el tipo
    async updateCategoryOptions() {
        const type = document.querySelector('input[name="type"]:checked').value;
        await this.renderCategories(type);
    }

    // Renderizar categorías dinámicamente en el select
    async renderCategories(type = null) {
        const categorySelect = document.getElementById('category');
        const categories = await this.storage.getCategories();
        if (!categories) return;

        // Limpiar opciones excepto la primera
        categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';

        // Si no se especifica tipo, usar el tipo seleccionado actualmente
        const selectedType = type || document.querySelector('input[name="type"]:checked').value;
        
        // Mostrar solo las categorías del tipo seleccionado
        if (categories[selectedType] && categories[selectedType].length > 0) {
            categories[selectedType].forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = `${cat.icon} ${cat.name}`;
                categorySelect.appendChild(option);
            });
        } else {
            // Si no hay categorías, agregar una opción deshabilitada
            const option = document.createElement('option');
            option.disabled = true;
            option.textContent = 'No hay categorías disponibles';
            categorySelect.appendChild(option);
        }

        // Resetear selección
        categorySelect.selectedIndex = 0;
    }

    // Abrir modal de gestión de categorías
    openCategoryModal() {
        const type = document.querySelector('input[name="type"]:checked').value;
        document.getElementById('category-modal').classList.remove('hidden');
        this.renderCategoryLists(type);
    }

    // Cerrar modal de gestión de categorías
    closeCategoryModal() {
        document.getElementById('category-modal').classList.add('hidden');
        // Limpiar inputs
        document.getElementById('new-income-category-name').value = '';
        document.getElementById('new-income-category-icon').value = '';
        document.getElementById('new-expense-category-name').value = '';
        document.getElementById('new-expense-category-icon').value = '';
    }

    // Renderizar listas de categorías en el modal
    async renderCategoryLists(type) {
        const incomeListContainer = document.querySelector('#income-category-list').parentElement;
        const expenseListContainer = document.querySelector('#expense-category-list').parentElement;
        const incomeList = document.getElementById('income-category-list');
        const expenseList = document.getElementById('expense-category-list');
        const categories = await this.storage.getCategories();
        if (!categories) return;

        incomeList.innerHTML = '';
        expenseList.innerHTML = '';

        if (type === 'income') {
            incomeListContainer.style.display = 'block';
            expenseListContainer.style.display = 'none';

            categories.income.forEach(cat => {
                const li = document.createElement('li');
                li.textContent = `${cat.icon} ${cat.name}`;
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Eliminar';
                delBtn.className = 'delete-category-btn';
                delBtn.dataset.id = cat.id;
                li.appendChild(delBtn);
                incomeList.appendChild(li);
            });
        } else if (type === 'expense') {
            incomeListContainer.style.display = 'none';
            expenseListContainer.style.display = 'block';

            categories.expense.forEach(cat => {
                const li = document.createElement('li');
                li.textContent = `${cat.icon} ${cat.name}`;
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Eliminar';
                delBtn.className = 'delete-category-btn';
                delBtn.dataset.id = cat.id;
                li.appendChild(delBtn);
                expenseList.appendChild(li);
            });
        } else {
            // Show both if no type specified
            incomeListContainer.style.display = 'block';
            expenseListContainer.style.display = 'block';

            categories.income.forEach(cat => {
                const li = document.createElement('li');
                li.textContent = `${cat.icon} ${cat.name}`;
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Eliminar';
                delBtn.className = 'delete-category-btn';
                delBtn.dataset.id = cat.id;
                li.appendChild(delBtn);
                incomeList.appendChild(li);
            });

            categories.expense.forEach(cat => {
                const li = document.createElement('li');
                li.textContent = `${cat.icon} ${cat.name}`;
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Eliminar';
                delBtn.className = 'delete-category-btn';
                delBtn.dataset.id = cat.id;
                li.appendChild(delBtn);
                expenseList.appendChild(li);
            });
        }
    }

    // Añadir categoría nueva
    async addCategory(type) {
        const nameInput = document.getElementById(`new-${type}-category-name`);
        const iconInput = document.getElementById(`new-${type}-category-icon`);
        const name = nameInput.value.trim();
        // Icono es opcional, si no se ingresa se usa un icono por defecto
        const icon = iconInput.value.trim() || '🏷️';

        if (!name) {
            alert('Por favor ingresa un nombre para la categoría');
            return;
        }

        // Generar id simple a partir del nombre
        const id = name.toLowerCase().replace(/\s+/g, '-');

        const newCategory = { id, name, icon };

        const success = await this.storage.addCategory(type, newCategory);
        if (success) {
            await this.renderCategoryLists(type);
            await this.renderCategories(type);
            nameInput.value = '';
            iconInput.value = '';
            this.showNotification(`Categoría "${name}" agregada`, 'success');
        } else {
            alert('La categoría ya existe');
        }
    }

    // Eliminar categoría
    async deleteCategory(type, categoryId) {
        this.showConfirmDialog('¿Estás seguro de que quieres eliminar esta categoría?')
            .then(async confirmed => {
                if (confirmed) {
                    const success = await this.storage.deleteCategory(type, categoryId);
                    if (success) {
                        await this.renderCategoryLists(type);
                        await this.renderCategories(type);
                        this.showNotification('Categoría eliminada', 'info');
                    } else {
                        alert('No se pudo eliminar la categoría');
                    }
                }
            });
    }

    // Mostrar diálogo de confirmación personalizado
    showConfirmDialog(message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const messageElem = document.getElementById('confirm-message');
            const yesBtn = document.getElementById('confirm-yes');
            const noBtn = document.getElementById('confirm-no');

            messageElem.textContent = message;
            modal.classList.remove('hidden');

            const cleanUp = () => {
                yesBtn.removeEventListener('click', onYes);
                noBtn.removeEventListener('click', onNo);
                modal.classList.add('hidden');
            };

            const onYes = () => {
                cleanUp();
                resolve(true);
            };

            const onNo = () => {
                cleanUp();
                resolve(false);
            };

            yesBtn.addEventListener('click', onYes);
            noBtn.addEventListener('click', onNo);
        });
    }

    // Agregar transacción
    async addTransaction() {
        const formData = {
            type: document.querySelector('input[name="type"]:checked').value,
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            description: document.getElementById('description').value.trim(),
            date: document.getElementById('date').value
        };

        // Validar datos
        if (!formData.category) {
            alert('Por favor selecciona una categoría');
            return;
        }

        if (isNaN(formData.amount) || formData.amount <= 0) {
            alert('Por favor ingresa una cantidad válida mayor que cero');
            return;
        }

        // Guardar transacción
        const result = await this.storage.addTransaction(formData);

        if (result) {
        // Actualizar UI
            await this.updateBalance();
            await this.loadTransactions();
        
        // Limpiar formulario
        document.getElementById('transaction-form').reset();
        this.setCurrentDate();
            await this.updateCategoryOptions();

        // Mostrar mensaje de éxito
        this.showNotification('Transacción agregada exitosamente', 'success');

        // Cambiar a la pestaña de transacciones
        this.switchTab('list');
        } else {
            this.showNotification('Error al agregar la transacción', 'error');
        }
    }

    // Eliminar transacción
    async deleteTransaction(id) {
        this.showConfirmDialog('¿Estás seguro de que quieres eliminar esta transacción?')
            .then(async confirmed => {
                if (confirmed) {
                    const success = await this.storage.deleteTransaction(id);
                    if (success) {
                        await this.updateBalance();
                        await this.loadTransactions();
                    this.showNotification('Transacción eliminada', 'info');
                    } else {
                        this.showNotification('Error al eliminar la transacción', 'error');
                    }
                }
            });
    }

    // Actualizar balance
    async updateBalance() {
        const totals = await this.storage.calculateTotals();
        
        document.getElementById('balance').textContent = `$${totals.balance.toFixed(2)}`;
        document.getElementById('total-income').textContent = `$${totals.income.toFixed(2)}`;
        document.getElementById('total-expense').textContent = `$${totals.expense.toFixed(2)}`;
        
        // Cambiar color del balance según sea positivo o negativo
        const balanceElement = document.getElementById('balance');
        if (totals.balance >= 0) {
            balanceElement.style.color = '#00e676';
            balanceElement.style.textShadow = '0 1px 2px rgba(0, 230, 118, 0.3)';
        } else {
            balanceElement.style.color = '#ff1744';
            balanceElement.style.textShadow = '0 1px 2px rgba(255, 23, 68, 0.3)';
        }
    }

    // Cargar transacciones
    async loadTransactions() {
        const type = document.getElementById('filter-type').value;
        const month = document.getElementById('filter-month').value;
        const transactions = await this.storage.getTransactions({ type, month });
        const listContainer = document.getElementById('transactions-list');

        if (transactions.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <p>No hay transacciones para mostrar</p>
                    <p style="font-size: 14px;">Agrega tu primera transacción para comenzar</p>
                </div>
            `;
            return;
        }

        // Ordenar transacciones por fecha (más reciente primero)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Agrupar transacciones por fecha
        const transactionsByDate = {};
        for (const transaction of transactions) {
            const date = new Date(transaction.date);
            const dateKey = date.toLocaleDateString('es-ES', { 
                weekday: 'long',
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
            
            if (!transactionsByDate[dateKey]) {
                transactionsByDate[dateKey] = {
                    date: transaction.date,
                    transactions: [],
                    totalIncome: 0,
                    totalExpense: 0
                };
            }
            
            transactionsByDate[dateKey].transactions.push(transaction);
            if (transaction.type === 'income') {
                transactionsByDate[dateKey].totalIncome += parseFloat(transaction.amount);
            } else {
                transactionsByDate[dateKey].totalExpense += parseFloat(transaction.amount);
            }
        }

        // Construir HTML de todas las transacciones agrupadas
        let transactionsHTML = '';
        
        for (const [dateKey, group] of Object.entries(transactionsByDate)) {
            const dayBalance = group.totalIncome - group.totalExpense;
            
            transactionsHTML += `
                <div class="transaction-date-group">
                    <div class="date-header">
                        <span class="date-text">${dateKey}</span>
                        <span class="date-balance ${dayBalance >= 0 ? 'positive' : 'negative'}">
                            ${dayBalance >= 0 ? '+' : ''}$${dayBalance.toFixed(2)}
                        </span>
                    </div>
            `;
            
            for (const transaction of group.transactions) {
                const categoryInfo = await this.storage.getCategoryInfo(transaction.category);
                const time = new Date(transaction.date).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                
                transactionsHTML += `
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <div class="transaction-category">
                                ${categoryInfo ? categoryInfo.icon : ''} ${categoryInfo ? categoryInfo.name : transaction.category}
                            </div>
                            ${transaction.description ? `<div class="transaction-description">${transaction.description}</div>` : ''}
                            <div class="transaction-time">${time}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="transaction-amount ${transaction.type}">
                                ${transaction.type === 'income' ? '+' : '-'}$${parseFloat(transaction.amount).toFixed(2)}
                            </span>
                            <button class="delete-btn" data-id="${transaction.id}" title="Eliminar">🗑️</button>
                        </div>
                    </div>
                `;
            }
            
            transactionsHTML += '</div>';
        }
        
        listContainer.innerHTML = transactionsHTML;
    }

    // Cargar filtro de meses
    async loadMonthFilter() {
        const monthFilter = document.getElementById('filter-month');
        const availableMonths = await this.storage.getAvailableMonths();
        
        // Nombres de meses en español
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        monthFilter.innerHTML = '<option value="all">Todos los meses</option>';
        
        availableMonths.forEach(month => {
            const [year, monthNum] = month.split('-');
            const monthIndex = parseInt(monthNum) - 1;
            const monthName = monthNames[monthIndex];
            
            monthFilter.innerHTML += `
                <option value="${month}">${monthName} ${year}</option>
            `;
        });
    }
    
    // Manejar cambios en tiempo real
    handleRealtimeChanges(changes) {
        changes.forEach(change => {
            if (change.type === 'added' || change.type === 'modified') {
                // Actualizar UI cuando se agregan o modifican transacciones
                this.updateBalance();
                this.loadTransactions();
                this.showNotification('Datos sincronizados', 'info');
            } else if (change.type === 'removed') {
                // Actualizar UI cuando se eliminan transacciones
                this.updateBalance();
                this.loadTransactions();
            }
        });
    }
    
    // Actualizar estado de sincronización
    updateSyncStatus() {
        if (this.storage.getSyncStatus) {
            const status = this.storage.getSyncStatus();
            
            // Puedes mostrar un indicador visual del estado de sincronización
            if (status.cloudEnabled && status.online) {
                console.log('Sincronización en la nube activa');
                // Aquí puedes agregar un ícono de nube en la UI
            } else if (!status.online) {
                console.log('Trabajando sin conexión');
                // Mostrar indicador offline
            }
        }
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Agregar al contenedor principal en lugar del body
        const container = document.querySelector('.container');
        container.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Métodos del picker eliminados - ahora usamos select nativo

    setupPullToRefresh() {
        const container = document.querySelector('.container');
        const pullToRefresh = document.querySelector('.pull-to-refresh');
        let touchStartY = 0;
        let touchEndY = 0;
        let refreshing = false;
        const minPullDistance = 100;

        container.addEventListener('touchstart', e => {
            if (container.scrollTop === 0) {
                touchStartY = e.touches[0].clientY;
                pullToRefresh.classList.add('visible');
            }
        });

        container.addEventListener('touchmove', e => {
            if (refreshing || container.scrollTop > 0) return;

            touchEndY = e.touches[0].clientY;
            const pullDistance = touchEndY - touchStartY;

            if (pullDistance > 0 && pullDistance < minPullDistance) {
                pullToRefresh.style.top = `${pullDistance - 60}px`;
                pullToRefresh.classList.remove('ready');
            } else if (pullDistance >= minPullDistance) {
                pullToRefresh.classList.add('ready');
            }
        });

        container.addEventListener('touchend', async () => {
            if (refreshing) return;

            const pullDistance = touchEndY - touchStartY;
            pullToRefresh.style.top = '';

            if (pullDistance >= minPullDistance) {
                refreshing = true;
                pullToRefresh.classList.add('refreshing');
                this.vibrateDevice('short');

                // Simular actualización de datos
                await this.refreshData();

                refreshing = false;
                pullToRefresh.classList.remove('refreshing', 'ready', 'visible');
                this.vibrateDevice('success');
            } else {
                pullToRefresh.classList.remove('visible');
            }
        });
    }

    async refreshData() {
        // Sincronizar con la nube si está disponible
        if (this.storage.syncData) {
            await this.storage.syncData();
        }
        
        // Recargar datos
        await this.loadTransactions();
        await this.updateBalance();
        if (this.currentTab === 'stats' && chartManager) {
            chartManager.updateAllCharts();
        }
        this.showNotification('Datos actualizados', 'success');
    }


}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new ExpenseTracker();
    
    // Actualizar filtro de meses cuando cambie el filtro de tipo
    document.getElementById('filter-type').addEventListener('change', () => {
        app.loadMonthFilter();
    });
});

// PWA - Instalar aplicación
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar botón de instalación
    const installBtn = document.createElement('button');
    installBtn.className = 'install-btn';
    installBtn.textContent = '📱 Instalar App';
    installBtn.style.display = 'block';
    document.body.appendChild(installBtn);
    
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('Usuario aceptó instalar la app');
            }
            
            deferredPrompt = null;
            installBtn.style.display = 'none';
        }
    });
});
