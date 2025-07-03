# 💰 Expense Tracker PWA - Gestor de Gastos e Ingresos

Una aplicación web progresiva (PWA) completa y escalable para gestionar finanzas personales con sincronización en la nube, funcionamiento offline y preparada para Google Play Store.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PWA](https://img.shields.io/badge/PWA-ready-orange.svg)

## ✨ Características Principales

### 💾 Almacenamiento Híbrido
- **Sincronización en la nube** con Firebase Firestore
- **Funcionamiento offline** completo con localStorage
- **Sincronización automática** cuando hay conexión
- **Migración automática** de datos locales a la nube

### 🔐 Seguridad Avanzada
- **Autenticación con Google** (Firebase Auth)
- **PIN, contraseña o huella digital** para acceso local
- **Encriptación de datos** con Web Crypto API (PBKDF2 + AES-256)
- **Sesiones seguras** con expiración automática

### 📊 Visualización de Datos
- **Gráficos interactivos** de gastos por categoría
- **Tendencias mensuales** de ingresos vs gastos
- **Resumen detallado** del mes actual
- **Estadísticas en tiempo real**

### 🌍 Internacionalización
- Español (predeterminado)
- English
- Français  
- Português

### 🎨 Personalización
- **7 temas visuales** (Verde, Azul, Púrpura, Rojo, Naranja, Gris, Oscuro)
- **Categorías personalizables** con iconos emoji
- **Interfaz adaptable** a preferencias del usuario

### 📱 Características PWA
- **Instalable** en cualquier dispositivo
- **Funciona sin conexión**
- **Actualizaciones automáticas**
- **Notificaciones push** (próximamente)

## 🚀 Instalación y Uso

### Opción 1: Usar en línea
1. Visita [https://tu-dominio.web.app](https://tu-dominio.web.app)
2. Inicia sesión con Google
3. Configura tu método de seguridad (PIN/contraseña/huella)
4. ¡Comienza a registrar tus transacciones!

### Opción 2: Instalación local
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/expense-tracker.git
cd expense-tracker

# Configurar Firebase (necesitas una cuenta)
# 1. Crea un proyecto en Firebase Console
# 2. Habilita Authentication y Firestore
# 3. Copia tu configuración a js/firebase-config.js

# Servir localmente
npx serve -s .
# O usar cualquier servidor HTTP local
```

### Opción 3: Desplegar en Firebase
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar proyecto
firebase init

# Desplegar
firebase deploy
```

## 📱 Preparación para Google Play Store

### Usando Capacitor (Recomendado)
```bash
# Instalar dependencias
npm init -y
npm install @capacitor/core @capacitor/android @capacitor/cli

# Inicializar Capacitor
npx cap init "Expense Tracker" "com.tudominio.expensetracker"

# Agregar plataforma Android
npx cap add android

# Copiar archivos web
npx cap sync

# Abrir en Android Studio
npx cap open android
```

### Configuración adicional para Play Store:
1. **Iconos y splash screens** en diferentes resoluciones
2. **Permisos** en AndroidManifest.xml
3. **Firma digital** del APK/AAB
4. **Capturas de pantalla** y descripción para la tienda

## 🏗️ Arquitectura

El proyecto sigue una arquitectura modular y escalable:

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend PWA  │────▶│ Storage      │────▶│  Firebase   │
│   (HTML/JS)     │     │ Adapter      │     │  Firestore  │
└─────────────────┘     └──────────────┘     └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ localStorage │
                        │  (Offline)   │
                        └──────────────┘
```

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para más detalles.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Gráficos**: Chart.js
- **Base de datos**: Firebase Firestore + localStorage
- **Autenticación**: Firebase Auth
- **PWA**: Service Workers, Web App Manifest
- **Seguridad**: Web Crypto API

## 📈 Roadmap

### v2.1 (Próxima versión)
- [ ] Notificaciones push para recordatorios
- [ ] Exportación a PDF/Excel
- [ ] Modo oscuro automático según hora

### v3.0 (Futuro)
- [ ] Presupuestos y metas de ahorro
- [ ] Escaneo de recibos con OCR
- [ ] Sincronización con cuentas bancarias
- [ ] Compartir gastos con familia

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Comunidad de Firebase por la excelente documentación
- Contribuidores de Chart.js
- Todos los testers beta

---

**⭐ Si te gusta este proyecto, dale una estrella en GitHub! ⭐**