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
                localStorage.setItem(`${type}_hash`, hash);
                localStorage.setItem(`${type}_salt`, salt);
                localStorage.setItem('auth_type', type);
                return true;
            } else if (type === 'biometric') {
                localStorage.setItem('auth_type', 'biometric');
                localStorage.setItem('biometric_enabled', 'true');
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
                const storedHash = localStorage.getItem(`${type}_hash`);
                const storedSalt = localStorage.getItem(`${type}_salt`);
                
                if (!storedHash || !storedSalt) {
                    // Verificar formato antiguo por compatibilidad
                    const oldCredential = localStorage.getItem(type);
                    if (oldCredential && oldCredential === credential) {
                        // Migrar al nuevo formato
                        await this.saveCredentials('', type, credential);
                        return true;
                    }
                    return false;
                }
                
                return await this.verifyPassword(credential, storedHash, storedSalt);
            } else if (type === 'biometric') {
                // La verificación biométrica se maneja con Web Authentication API
                return await this.verifyBiometric('');
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
        return localStorage.getItem('biometric_enabled') === 'true';
    }

    // Limpiar credenciales antiguas
    cleanupOldCredentials() {
        // Eliminar credenciales en texto plano si existen
        localStorage.removeItem('pin');
        localStorage.removeItem('password');
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