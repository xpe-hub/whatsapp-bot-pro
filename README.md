# XPE WhatsApp Bot

🤖 **Bot de WhatsApp moderno desarrollado con TypeScript y Baileys v6**

Un bot de WhatsApp simplificado y eficiente, perfecto para desarrollo local y despliegue en Railway.

## 🚀 Instalación Local

### Prerrequisitos
- **Node.js 20+** ([Descargar aquí](https://nodejs.org/))
- **npm** (incluido con Node.js)

### Configuración Rápida

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/xpe-hub/xpe-bot.git
   cd xpe-bot
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env`:
   ```env
   # Variables esenciales
   SESSION_NAME=xpe-bot
   OPENAI_API_KEY=tu_api_key_aqui  # Opcional
   PORT=3000
   ```

4. **Compilar TypeScript:**
   ```bash
   npm run build
   ```

5. **¡Ejecutar el bot!**
   ```bash
   npm start
   ```

## 📱 Conexión WhatsApp

1. **Ejecuta el bot** con `npm start`
2. **Escanea el código QR** que aparece en la terminal
3. **Abre WhatsApp** en tu teléfono
4. **Ve a "Dispositivos vinculados"**
5. **Escanea el código QR** con la cámara de WhatsApp
6. **¡Listo!** El bot estará conectado

## 🔧 Comandos Disponibles

Una vez conectado a WhatsApp:
- `!ping` - Verificar que el bot está funcionando
- `!info` - Información del estado del bot  
- `!help` - Lista de comandos disponibles

## 🛠️ Desarrollo

**Modo desarrollo (con recarga automática):**
```bash
npm run dev
```

**Health checks:**
- **Health:** http://localhost:3000/health
- **Status:** http://localhost:3000/status

## 📁 Estructura del Proyecto

```
src/
├── index.ts              # Entry point principal
├── lib/
│   └── WhatsAppBot.ts    # Lógica principal del bot
└── database/
    └── SQLiteDatabase.ts # Base de datos SQLite
```

## 🚨 Solución de Problemas

**Error: "Cannot find module"**
```bash
npm install
npm run build
```

**Error: "WhatsApp not connected"**
- Escanea el código QR en la terminal
- Verifica que tu teléfono tenga WhatsApp Web activo

**Error: "Port 3000 in use"**
- Cambia el puerto en `.env` (ej: PORT=3001)
- O detén el proceso que usa el puerto

## 📝 Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `SESSION_NAME` | Nombre de sesión del bot | ✅ |
| `OPENAI_API_KEY` | API key de OpenAI (opcional) | ❌ |
| `PORT` | Puerto del servidor web | ❌ (3000) |

## 🔒 Seguridad

- **Nunca compartas** tu `SESSION_NAME` ni API keys
- **Reinicia el bot** si cambias variables de entorno
- **Mantén actualizado** Node.js y dependencias

## 🚀 Despliegue en Railway

El bot está optimizado para Railway con:
- ✅ **npm** como package manager (no yarn)
- ✅ **Node.js 20** configurado
- ✅ **Health endpoints** para Railway
- ✅ **SQLite** (base de datos embebida)

## 📞 Soporte

Si tienes problemas:
1. Verifica Node.js 20+: `node --version`
2. Limpia caché: `npm cache clean --force`
3. Reinstala: `rm -rf node_modules && npm install`