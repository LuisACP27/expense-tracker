# 📐 Arquitectura del Proyecto - Expense Tracker PWA

## 🏗️ Visión General

El Expense Tracker es una Progressive Web App (PWA) escalable diseñada para gestionar finanzas personales con sincronización en la nube, funcionamiento offline y seguridad mejorada.

## 🔧 Stack Tecnológico

### Frontend
- **HTML5/CSS3/JavaScript ES6+** - Sin frameworks, código vanilla optimizado
- **Chart.js** - Visualización de datos
- **Web APIs**: 
  - Service Worker (offline)
  - Web Crypto API (encriptación)
  - IndexedDB (almacenamiento grande)
  - Web Authentication API (biometría)

### Backend/Cloud
- **Firebase Authentication** - Autenticación con Google
- **Firebase Firestore** - Base de datos NoSQL en tiempo real
- **Firebase Hosting** - Despliegue de la PWA

## 📁 Estructura del Proyecto

```
expense-tracker/
├── index.html              # Página principal
├── manifest.json           # Configuración PWA
├── service-worker.js       # Gestión offline
├── css/
│   └── styles.css         # Estilos principales
├── js/
│   ├── app.js             # Lógica principal de la aplicación
│   ├── storage.js         # Almacenamiento local
│   ├── firebase-config.js # Configuración Firebase
│   ├── firebase-firestore.js # Gestión Firestore
│   ├── storage-adapter.js # Adaptador unificado de almacenamiento
│   ├── security.js        # Gestión de seguridad y encriptación
│   ├── charts.js          # Visualización de datos
│   ├── language.js        # Internacionalización
│   └── themes.js          # Sistema de temas
└── assets/
    └── icons/             # Iconos PWA
```

## 🏛️ Arquitectura de Componentes

### 1. **Capa de Almacenamiento**
```javascript
┌─────────────────────────────────────┐
│         StorageAdapter              │
│  (Interfaz unificada de acceso)     │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼─────┐  ┌──────▼──────┐
│ localStorage│  │  Firestore   │
│  (Offline)  │  │   (Cloud)    │
└─────────────┘  └──────────────┘
```

### 2. **Sincronización de Datos**
- **Sincronización automática** cada 30 segundos
- **Detección de conectividad** para sincronizar al volver online
- **Cola de operaciones offline** para ejecutar cuando hay conexión
- **Migración automática** de datos locales a la nube

### 3. **Seguridad Multicapa**
```javascript
Usuario → PIN/Password/Biometría
          ↓
    SecurityManager
          ↓
    PBKDF2 Hashing (10k iteraciones)
          ↓
    AES-256-GCM (datos sensibles)
          ↓
    Almacenamiento seguro
```

## 🔄 Flujo de Datos

### Agregar Transacción
1. Usuario ingresa datos en el formulario
2. Validación en cliente
3. StorageAdapter determina el método de guardado:
   - **Online**: Firestore → localStorage (backup)
   - **Offline**: localStorage → Cola de sincronización
4. Actualización de UI en tiempo real
5. Sincronización en segundo plano

### Consultar Datos
1. StorageAdapter verifica disponibilidad
2. Prioridad: Firestore (si online) → localStorage (fallback)
3. Caché en memoria para rendimiento
4. Actualización automática vía listeners

## 🚀 Características de Escalabilidad

### 1. **Modularidad**
- Componentes independientes y reutilizables
- Inyección de dependencias
- Interfaces claras entre módulos

### 2. **Rendimiento**
- Lazy loading de componentes
- Caché inteligente
- Operaciones asíncronas no bloqueantes
- Debouncing y throttling en eventos

### 3. **Escalabilidad de Datos**
- Paginación en consultas Firestore
- Índices optimizados
- Limpieza automática de datos antiguos
- Compresión de datos históricos

### 4. **Internacionalización**
- Sistema completo i18n
- 4 idiomas soportados
- Fácil adición de nuevos idiomas

### 5. **Temas y Personalización**
- 7 temas predefinidos
- Sistema extensible de temas
- Preferencias por usuario

## 📱 Preparación para Google Play Store

### Usando Capacitor (Recomendado)
```bash
# Instalar Capacitor
npm install @capacitor/core @capacitor/android

# Inicializar proyecto Android
npx cap init
npx cap add android

# Construir y sincronizar
npm run build
npx cap sync android
npx cap open android
```

### Características Nativas
- **Notificaciones Push**: Firebase Cloud Messaging
- **Almacenamiento Nativo**: Plugin Capacitor Storage
- **Biometría**: Plugin Capacitor Biometric Auth
- **Sincronización en Background**: WorkManager

## 🔐 Seguridad Implementada

1. **Autenticación de dos factores**
   - Google OAuth + PIN/Password local

2. **Encriptación de datos**
   - PBKDF2 para passwords
   - AES-256-GCM para datos sensibles

3. **Validación exhaustiva**
   - Sanitización de inputs
   - Prevención XSS
   - CORS configurado

4. **Sesiones seguras**
   - Tokens con expiración
   - Renovación automática

## 📊 Métricas y Analytics

### Firebase Analytics (Por implementar)
```javascript
// Eventos sugeridos
analytics.logEvent('transaction_added', {
  type: 'expense',
  category: 'food',
  amount: 25.50
});

analytics.logEvent('sync_completed', {
  items_synced: 15,
  duration_ms: 1200
});
```

## 🛠️ Herramientas de Desarrollo Recomendadas

### Build System (Por implementar)
```json
{
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack-dev-server",
    "test": "jest",
    "lint": "eslint js/",
    "deploy": "firebase deploy"
  }
}
```

### Testing (Por implementar)
- **Jest**: Unit testing
- **Cypress**: E2E testing
- **Lighthouse**: PWA auditing

## 🚦 Próximos Pasos

1. **Corto Plazo**
   - [ ] Implementar webpack para bundling
   - [ ] Agregar tests unitarios
   - [ ] Configurar CI/CD
   - [ ] Implementar Firebase Analytics

2. **Mediano Plazo**
   - [ ] Migrar a TypeScript
   - [ ] Implementar GraphQL
   - [ ] Agregar exportación PDF
   - [ ] Sistema de presupuestos

3. **Largo Plazo**
   - [ ] API REST pública
   - [ ] Versión desktop con Electron
   - [ ] Machine Learning para categorización
   - [ ] Integración bancaria

## 📝 Mejores Prácticas

1. **Código**
   - Usar async/await sobre callbacks
   - Documentar funciones complejas
   - Mantener funciones pequeñas y enfocadas

2. **Git**
   - Commits semánticos
   - Feature branches
   - Pull requests con revisión

3. **Seguridad**
   - Nunca confiar en datos del cliente
   - Validar en servidor y cliente
   - Mantener dependencias actualizadas

4. **Performance**
   - Medir antes de optimizar
   - Usar Chrome DevTools
   - Lighthouse audits regulares 