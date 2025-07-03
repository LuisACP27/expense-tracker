// security.js - Gestión mejorada de seguridad con encriptación

class SecurityManager {
    constructor() {
        this.SALT_PREFIX = 'expense_tracker_salt_';
        this.ITERATIONS = 10000;
        this.KEY_LENGTH = 256;
    }

    // Generar un salt aleatorio
    generateSalt() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return this.arrayToBase64(array);
    }

    // Convertir array a base64
    arrayToBase64(array) {
        return btoa(String.fromCharCode.apply(null, array));
    }

    // Convertir base64 a array
    base64ToArray(base64) {
        const binaryString = atob(base64);
        const array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            array[i] = binaryString.charCodeAt(i);
        }
        return array;
    }

    // Hash de contraseña usando PBKDF2
    async hashPassword(password, salt = null) {
        try {
            // Si no se proporciona salt, generar uno nuevo
            if (!salt) {
                salt = this.generateSalt();
            }

            // Convertir contraseña a buffer
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);

            // Importar contraseña como clave
            const passwordKey = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveBits']
            );

            // Derivar bits usando PBKDF2
            const saltBuffer = this.base64ToArray(salt);
            const derivedBits = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: saltBuffer,
                    iterations: this.ITERATIONS,
                    hash: 'SHA-256'
                },
                passwordKey,
                this.KEY_LENGTH
            );

            // Convertir a base64
            const hashArray = new Uint8Array(derivedBits);
            const hash = this.arrayToBase64(hashArray);

            return {
                hash: hash,
                salt: salt
            };
        } catch (error) {
            console.error('Error al hashear contraseña:', error);
            // Fallback a método simple si Web Crypto API no está disponible
            return this.simpleHash(password, salt);
        }
    }

    // Método de hash simple como fallback
    simpleHash(password, salt = null) {
        if (!salt) {
            salt = Math.random().toString(36).substring(2, 15);
        }
        
        // Método simple pero mejor que texto plano
        let hash = password + salt;
        for (let i = 0; i < 100; i++) {
            hash = btoa(hash);
        }
        
        return {
            hash: hash,
            salt: salt
        };
    }

    // Verificar contraseña
    async verifyPassword(password, storedHash, storedSalt) {
        const result = await this.hashPassword(password, storedSalt);
        return result.hash === storedHash;
    }

    // Guardar credenciales de forma segura
    async saveCredentials(userPrefix, type, credential) {
        try {
            if (type === 'pin' || type === 'password') {
                const { hash, salt } = await this.hashPassword(credential);
                localStorage.setItem(`${userPrefix}_${type}_hash`, hash);
                localStorage.setItem(`${userPrefix}_${type}_salt`, salt);
                localStorage.setItem(`${userPrefix}_auth_type`, type);
                return true;
            } else if (type === 'biometric') {
                localStorage.setItem(`${userPrefix}_auth_type`, 'biometric');
                localStorage.setItem(`${userPrefix}_biometric_enabled`, 'true');
                return true;
            }
        } catch (error) {
            console.error('Error guardando credenciales:', error);
            return false;
        }
    }

    // Verificar credenciales
    async verifyCredentials(userPrefix, type, credential) {
        try {
            if (type === 'pin' || type === 'password') {
                const storedHash = localStorage.getItem(`${userPrefix}_${type}_hash`);
                const storedSalt = localStorage.getItem(`${userPrefix}_${type}_salt`);
                
                if (!storedHash || !storedSalt) {
                    // Verificar formato antiguo por compatibilidad
                    const oldCredential = localStorage.getItem(`${userPrefix}_${type}`);
                    if (oldCredential && oldCredential === credential) {
                        // Migrar al nuevo formato
                        await this.saveCredentials(userPrefix, type, credential);
                        return true;
                    }
                    return false;
                }
                
                return await this.verifyPassword(credential, storedHash, storedSalt);
            } else if (type === 'biometric') {
                // La verificación biométrica se maneja con Web Authentication API
                return await this.verifyBiometric(userPrefix);
            }
        } catch (error) {
            console.error('Error verificando credenciales:', error);
            return false;
        }
    }

    // Verificar autenticación biométrica
    async verifyBiometric(userPrefix) {
        // Esta es una implementación básica
        // En producción, deberías usar Web Authentication API (WebAuthn)
        if (!window.PublicKeyCredential) {
            throw new Error('Autenticación biométrica no soportada');
        }
        
        // Por ahora, simulamos la verificación
        return localStorage.getItem(`${userPrefix}_biometric_enabled`) === 'true';
    }

    // Limpiar credenciales antiguas
    cleanupOldCredentials(userPrefix) {
        // Eliminar credenciales en texto plano si existen
        localStorage.removeItem(`${userPrefix}_pin`);
        localStorage.removeItem(`${userPrefix}_password`);
        localStorage.removeItem('user_pin');
        localStorage.removeItem('user_password');
    }

    // Generar código de recuperación
    generateRecoveryCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) {
                code += '-';
            }
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Encriptar datos sensibles
    async encryptData(data, password) {
        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));
            
            // Generar clave de encriptación desde la contraseña
            const passwordBuffer = encoder.encode(password);
            const passwordKey = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveKey']
            );
            
            // Generar salt e IV aleatorios
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // Derivar clave AES
            const aesKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                passwordKey,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt']
            );
            
            // Encriptar datos
            const encryptedData = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                aesKey,
                dataBuffer
            );
            
            // Combinar salt, iv y datos encriptados
            const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(encryptedData), salt.length + iv.length);
            
            return this.arrayToBase64(combined);
        } catch (error) {
            console.error('Error encriptando datos:', error);
            throw error;
        }
    }

    // Desencriptar datos
    async decryptData(encryptedData, password) {
        try {
            const combined = this.base64ToArray(encryptedData);
            
            // Extraer salt, iv y datos encriptados
            const salt = combined.slice(0, 16);
            const iv = combined.slice(16, 28);
            const data = combined.slice(28);
            
            // Generar clave de desencriptación
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);
            const passwordKey = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveKey']
            );
            
            // Derivar clave AES
            const aesKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                passwordKey,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );
            
            // Desencriptar datos
            const decryptedData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                aesKey,
                data
            );
            
            // Convertir a texto y parsear JSON
            const decoder = new TextDecoder();
            const jsonString = decoder.decode(decryptedData);
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Error desencriptando datos:', error);
            throw error;
        }
    }
}

// Crear instancia global
const securityManager = new SecurityManager();

// Clase para manejar la página de opciones de seguridad
class SecurityOptionsPage {
    constructor(isChanging = false) {
        this.isChanging = isChanging;
        this.userPrefix = localStorage.getItem('current_user_prefix') || '';
        this.currentAuthType = localStorage.getItem(`${this.userPrefix}_auth_type`);
        this.isVerified = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCurrentSettings();
        this.updateUI();
    }

    setupEventListeners() {
        // Verificación de identidad
        document.getElementById('verify-auth').addEventListener('click', () => {
            this.verifyCurrentAuth();
        });

        // Cambio de tipo de seguridad
        document.querySelectorAll('input[name="security-type"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateAuthSections();
            });
        });

        // Guardar cambios
        document.getElementById('save-security').addEventListener('click', () => {
            this.saveSecurityChanges();
        });

        // Cancelar
        document.getElementById('cancel-security').addEventListener('click', () => {
            this.cancelChanges();
        });

        // Tecla Enter en el campo de verificación
        document.getElementById('current-auth').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.verifyCurrentAuth();
            }
        });
    }

    loadCurrentSettings() {
        if (this.currentAuthType) {
            // Marcar el tipo actual
            const currentRadio = document.querySelector(`input[value="${this.currentAuthType}"]`);
            if (currentRadio) {
                currentRadio.checked = true;
            }
        } else {
            // Si no hay configuración previa, marcar PIN por defecto
            document.querySelector('input[value="pin"]').checked = true;
        }
        
        this.updateAuthSections();
    }

    updateUI() {
        // Si es un cambio, mostrar sección de verificación
        if (this.isChanging) {
            document.getElementById('auth-verification').style.display = 'block';
            document.getElementById('security-config').style.display = 'none';
        } else {
            // Si es primera configuración, saltar verificación
            document.getElementById('auth-verification').style.display = 'none';
            document.getElementById('security-config').style.display = 'block';
            this.isVerified = true;
        }
    }

    async verifyCurrentAuth() {
        const currentAuthInput = document.getElementById('current-auth');
        const enteredAuth = currentAuthInput.value.trim();

        if (!enteredAuth) {
            this.showNotification('Por favor, ingresa tu PIN o contraseña actual', 'error');
            return;
        }

        try {
            const isValid = await securityManager.verifyCredentials(
                this.userPrefix, 
                this.currentAuthType, 
                enteredAuth
            );

            if (isValid) {
                this.isVerified = true;
                document.getElementById('auth-verification').style.display = 'none';
                document.getElementById('security-config').style.display = 'block';
                this.showNotification('Verificación exitosa', 'success');
            } else {
                this.showNotification('PIN o contraseña incorrecta', 'error');
                currentAuthInput.focus();
            }
        } catch (error) {
            console.error('Error verificando credenciales:', error);
            this.showNotification('Error en la verificación', 'error');
        }
    }

    updateAuthSections() {
        const selectedType = document.querySelector('input[name="security-type"]:checked').value;
        
        // Ocultar todas las secciones
        document.getElementById('new-pin-section').style.display = 'none';
        document.getElementById('new-password-section').style.display = 'none';

        // Mostrar la sección correspondiente
        if (selectedType === 'pin') {
            document.getElementById('new-pin-section').style.display = 'block';
        } else if (selectedType === 'password') {
            document.getElementById('new-password-section').style.display = 'block';
        }
    }

    async saveSecurityChanges() {
        if (!this.isVerified && this.isChanging) {
            this.showNotification('Primero debes verificar tu identidad', 'error');
            return;
        }

        const selectedType = document.querySelector('input[name="security-type"]:checked').value;
        let newCredential = '';

        // Validar y obtener la nueva credencial
        if (selectedType === 'pin') {
            const newPin = document.getElementById('new-pin').value;
            const confirmPin = document.getElementById('confirm-pin').value;

            if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
                this.showNotification('El PIN debe tener exactamente 4 dígitos', 'error');
                return;
            }

            if (newPin !== confirmPin) {
                this.showNotification('Los PINs no coinciden', 'error');
                return;
            }

            newCredential = newPin;
        } else if (selectedType === 'password') {
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (!newPassword || newPassword.length < 6) {
                this.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                this.showNotification('Las contraseñas no coinciden', 'error');
                return;
            }

            newCredential = newPassword;
        }

        // Mostrar confirmación
        this.showConfirmModal(() => {
            this.finalizeSecurityChanges(selectedType, newCredential);
        });
    }

    async finalizeSecurityChanges(type, credential) {
        try {
            // Limpiar configuración anterior
            this.clearPreviousConfig();

            // Guardar nueva configuración
            const success = await securityManager.saveCredentials(this.userPrefix, type, credential);

            if (success) {
                // Establecer sesión válida
                sessionStorage.setItem('pin_ok', '1');
                
                this.showNotification('Configuración de seguridad actualizada correctamente', 'success');
                
                // Redirigir después de un breve delay
                setTimeout(() => {
                    window.location.href = this.isChanging ? 'settings.html' : 'index.html';
                }, 2000);
            } else {
                this.showNotification('Error al guardar la configuración', 'error');
            }
        } catch (error) {
            console.error('Error guardando configuración:', error);
            this.showNotification('Error inesperado al guardar', 'error');
        }
    }

    clearPreviousConfig() {
        // Limpiar configuraciones de seguridad anteriores
        ['pin', 'password', 'biometric'].forEach(type => {
            localStorage.removeItem(`${this.userPrefix}_${type}_hash`);
            localStorage.removeItem(`${this.userPrefix}_${type}_salt`);
            localStorage.removeItem(`${this.userPrefix}_${type}`);
            localStorage.removeItem(`${this.userPrefix}_${type}_enabled`);
        });
        
        // Limpiar formato antiguo
        localStorage.removeItem(`${this.userPrefix}_pin`);
        localStorage.removeItem(`${this.userPrefix}_password`);
        localStorage.removeItem(`${this.userPrefix}_biometric_enabled`);
    }

    cancelChanges() {
        window.location.href = this.isChanging ? 'settings.html' : 'welcome.html';
    }

    showConfirmModal(onConfirm) {
        const modal = document.getElementById('confirm-modal');
        const confirmBtn = document.getElementById('confirm-yes');
        const cancelBtn = document.getElementById('confirm-no');

        modal.classList.remove('hidden');

        const handleConfirm = () => {
            modal.classList.add('hidden');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            onConfirm();
        };

        const handleCancel = () => {
            modal.classList.add('hidden');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notification-message');
        
        notification.className = `notification notification-${type}`;
        messageElement.textContent = message;
        
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
} 