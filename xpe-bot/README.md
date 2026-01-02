# 🤖 XPE Bot

![XPE Bot Banner](https://via.placeholder.com/1200x400/1A1A2E/00D4FF?text=XPE+Bot+-+Professional+WhatsApp+Automation)

<div align="center">

**Professional WhatsApp Automation Bot with Integrated Web Panel and AI Assistant**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)](https://github.com/xpe-systems/xpe-bot)

</div>

---

## ✨ Características Principales

XPE Bot es una solución profesional de automatización para WhatsApp, construida desde cero con arquitectura moderna y escalable. El bot incluye características avanzadas que lo diferencian de otros bots disponibles en el mercado, ofreciendo una experiencia completa tanto para usuarios como para administradores.

El sistema de **XPE Panel** proporciona un panel de control web integrado que permite monitorear el estado del bot en tiempo real, visualizar métricas de rendimiento como uso de memoria y uptime, ver logs del sistema actualizados al instante, enviar mensajes al grupo de owners directamente desde la interfaz web, y controlar el bot con opciones de reinicio y detención. Todo esto accesible desde cualquier navegador web moderno.

**XPE Assistant** es la inteligencia artificial integrada que convierte al bot en mucho más que una simple herramienta de automatización. Soporta conversación natural en múltiples idiomas, generación de código para plugins y comandos del bot, análisis de código existente para mejoras y optimización, y traducción automática de textos. La IA está disponible tanto a través de comandos de WhatsApp como directamente desde el panel web.

La arquitectura de **plugins modulares** permite extender las funcionalidades del bot sin modificar el código base. Los comandos están organizados en categorías claras que incluyen administración de grupos, inteligencia artificial, herramientas del owner, utilidades generales, multimedia, entretenimiento y descargas. Cada plugin sigue un formato estandarizado que facilita su desarrollo y mantenimiento.

El sistema de **notificaciones automáticas** mantiene informados a los owners sobre el estado del bot. El sistema puede notificar automáticamente cuando el bot se inicia, cuando hay actualizaciones disponibles en el repositorio, y cualquier evento crítico que requiera atención. Las notificaciones se envían directamente al grupo de owners configurado.

---

## 🚀 Instalación Rápida

La instalación de XPE Bot está diseñada para ser sencilla y directa. Sigue estos pasos para tener tu bot funcionando en pocos minutos.

### Requisitos Previos

Antes de instalar XPE Bot, necesitas tener instalado Node.js versión 18 o superior en tu sistema. Puedes descargar la versión LTS desde [nodejs.org](https://nodejs.org/). También necesitas Git para clonar el repositorio y gestionar actualizaciones. En sistemas Windows, asegúrate de tener las herramientas de compilación de C++ instaladas para algunas dependencias nativas.

### Pasos de Instalación

Primero, clona el repositorio oficial de XPE Bot usando Git. Este comando descargará la última versión estable del proyecto.

```bash
git clone https://github.com/xpe-systems/xpe-bot.git
cd xpe-bot
```

A continuación, instala todas las dependencias necesarias utilizando npm. Este proceso puede tomar varios minutos dependiendo de tu conexión a internet, ya que se descargarán múltiples paquetes de JavaScript.

```bash
npm install
```

Una vez completada la instalación de dependencias, configura el archivo de entorno. Copia el archivo de ejemplo y edítalo con tus preferencias.

```bash
cp .env.example .env
nano .env
```

En el archivo `.env`, debes configurar al menos las siguientes variables. `XPE_OWNER_NUMBER` debe ser tu número de WhatsApp en formato internacional sin el símbolo más, por ejemplo `5491112345678` para Argentina. `OPENAI_API_KEY` es necesaria para las funciones de IA, la obtienes en [platform.openai.com](https://platform.openai.com/api-keys). `OWNER_GROUP_ID` es el ID del grupo de WhatsApp donde se enviarán las notificaciones automáticas.

Una vez configurado, inicia el bot usando el siguiente comando.

```bash
npm start
```

En el primer inicio, se generará un código QR en la terminal. Escanea este código con la aplicación de WhatsApp en tu teléfono para vincular el bot a tu cuenta. El código QR se muestra solo una vez, así que asegúrate de escanearlo rápidamente.

---

## 📁 Estructura del Proyecto

La organización de archivos de XPE Bot sigue una arquitectura MVC (Model-View-Controller) simplificada que facilita el mantenimiento y la escalabilidad del proyecto.

```
xpe-bot/
├── .env.example              # Template de configuración
├── .gitignore                # Archivos ignorados por Git
├── package.json              # Dependencias y scripts
├── README.md                 # Documentación
│
├── config/
│   ├── branding.js           # Configuración de identidad y personalidad
│   └── settings.js           # Configuración del sistema
│
├── src/
│   ├── index.js              # Punto de entrada principal
│   │
│   ├── core/
│   │   ├── handler.js        # Procesador de mensajes
│   │   └── loader.js         # Cargador de plugins
│   │
│   ├── lib/
│   │   ├── logger.js         # Sistema de logs
│   │   └── utils.js          # Funciones utilitarias
│   │
│   └── services/
│       ├── ai-service.js     # Integración con OpenAI
│       └── panel-server.js   # Servidor web del panel
│
├── plugins/                  # Comandos modulares
│   ├── _admin/               # Administración de grupos
│   ├── _ai/                  # Comandos de IA
│   ├── _owner/               # Comandos del owner
│   ├── _utils/               # Utilidades
│   ├── _media/               # Multimedia
│   ├── _entertainment/       # Entretenimiento
│   └── _downloads/           # Descargas
│
├── web/                      # Panel web
│   └── public/
│       ├── index.html        # Interfaz del panel
│       ├── css/panel.css     # Estilos
│       └── js/panel.js       # Lógica del panel
│
├── sessions/                 # Sesiones de WhatsApp (auto-generado)
├── logs/                     # Logs del sistema (auto-generado)
└── backups/                  # Respaldeos (auto-generado)
```

El directorio `config/` contiene todos los archivos de configuración centralizados. El archivo `branding.js` define la identidad del bot incluyendo nombre, colores, mensajes del sistema y la personalidad de XPE Assistant. El archivo `settings.js` carga las variables de entorno y proporciona validación de configuración.

El directorio `src/` contiene el código fuente del bot. El archivo `index.js` es el punto de entrada que inicializa la conexión con WhatsApp usando Baileys, carga los plugins y configura el servidor del panel web. El directorio `core/` contiene la lógica fundamental del bot, incluyendo el manejador de mensajes que procesa todos los comandos entrantes y el cargador de plugins que permite la instalación dinámica de nuevas funcionalidades.

El directorio `plugins/` organiza los comandos por categorías. Cada subdirectorio representa una categoría y contiene archivos JavaScript que definen comandos. Para agregar un nuevo comando, simplemente crea un archivo en la categoría correspondiente y el bot lo cargará automáticamente al reiniciar.

---

## 📖 Uso del Bot

Una vez que el bot está ejecutándose, puedes interactuar con él usando comandos de texto en WhatsApp. Todos los comandos comienzan con el prefijo configurado, que por defecto es el signo de exclamación `!`. El bot responde tanto en chats individuales como en grupos, dependiendo de las restricciones de cada comando.

### Comandos Básicos

El comando `!ping` verifica que el bot esté activo y responde con información del sistema incluyendo latencia, uso de memoria y tiempo de actividad. Es útil para diagnosticar problemas de conectividad.

El comando `!menu` muestra la lista completa de comandos disponibles organizados por categorías. Puedes especificar una categoría específica como `!menu 1` para ver solo los comandos de una categoría particular.

El comando `!ayuda` seguido del nombre de un comando muestra información detallada sobre ese comando específico, incluyendo descripción, uso correcto y ejemplos.

### Comandos de IA

El comando `!ia` seguido de tu pregunta activa a XPE Assistant para responder. Por ejemplo, `!ia ¿Qué es un bot de WhatsApp?` generará una respuesta explicativa. La IA mantiene contexto conversacional, por lo que puedes continuar la conversación normalmente.

El comando `!codigo` genera código para el bot. Describe lo que necesitas, como `!codigo Crear un comando de bienvenida para grupos`, y XPE Assistant generará el código completo listo para usar.

El comando `!analizar` revisa código existente y proporciona un análisis detallado con fortalezas, problemas potenciales y sugerencias de mejora. Responde a un mensaje que contenga código o pega el código directamente.

El comando `!traducir` traduce texto entre idiomas. Usa el formato `!traducir en Hola mundo` para traducir al inglés, o `!traducir pt Hola` para portugués.

### Comandos de Owner

Estos comandos están restringidos para uso exclusivo del propietario del bot. El comando `!restart` reinicia el bot completamente, útil después de actualizaciones o cambios de configuración. El comando `!stop` detiene el bot por completo, requiriendo acceso al servidor para reiniciarlo manualmente. El comando `!broadcast` envía un mensaje a todos los chats donde está el bot, aunque por seguridad solo envía al owner y grupo de owners configurados. El comando `!leave` hace que el bot salga del grupo actual donde se ejecutó. El comando `!panel` muestra la URL del panel de control web.

---

## 🌐 XPE Panel

El panel web de XPE Bot proporciona una interfaz gráfica completa para administrar el bot sin necesidad de acceder al servidor directamente. El panel se accede desde un navegador web en la dirección `http://localhost:3000` cuando el bot está ejecutándose localmente.

El dashboard principal muestra métricas en tiempo real del bot, incluyendo estado de conexión, uptime del sistema, uso de memoria RAM y número de clientes WebSocket conectados. También ofrece botones de control rápido para reiniciar o detener el bot, y un formulario para enviar mensajes al grupo de owners.

La sección de comandos muestra todos los comandos disponibles organizados por categoría, con su descripción y formato de uso. Esta sección se actualiza automáticamente cuando se cargan nuevos plugins.

La sección de XPE Assistant permite chatear con la inteligencia artificial directamente desde el navegador, útil para generar código o responder preguntas sin necesidad de usar WhatsApp.

La sección de logs muestra todos los mensajes del sistema en tiempo real, con códigos de color según el tipo de mensaje. Esta herramienta es invaluable para diagnosticar problemas y monitorear la actividad del bot.

---

## 🔧 Configuración Avanzada

El archivo de configuración `.env` contiene numerosas opciones para personalizar el comportamiento del bot según tus necesidades específicas.

### Configuración Principal

La variable `XPE_COMMAND_PREFIX` define el carácter que precede a todos los comandos. Puedes cambiarla a `.`, `/`, o cualquier otro carácter que prefieras. La variable `XPE_OWNER_NUMBER` debe contener tu número de WhatsApp en formato internacional sin símbolos, como `5491112345678`. Este número se usa para identificar al propietario y enviar notificaciones.

### Configuración de IA

La variable `OPENAI_API_KEY` es esencial para las funciones de inteligencia artificial. Sin ella, los comandos como `!ia`, `!codigo` y `!analizar` no funcionarán. Genera una clave en la [plataforma de OpenAI](https://platform.openai.com/api-keys)._MODEL` permite elegir La variable `AI el modelo de IA a usar, siendo `gpt-4o` la opción más capaz pero más lenta y costosa.

### Configuración del Panel

La variable `PANEL_PORT` define el puerto donde se ejecutará el servidor web del panel. El valor por defecto es `3000`. La variable `PANEL_AUTH_TOKEN` establece un token de autenticación para el panel. En producción, cambia este valor por uno seguro y guárdalo en un lugar seguro.

### Configuración de Notificaciones

La variable `OWNER_GROUP_ID` contiene el ID del grupo de WhatsApp donde se enviarán las notificaciones automáticas. Para obtener este ID, primero agrega el bot a un grupo y luego ejecuta el comando `!estado` en ese grupo; el ID se mostrará en los logs. Las variables `NOTIFY_ON_START` y `NOTIFY_ON_UPDATES` controlan si el bot envía notificaciones al iniciar y cuando hay actualizaciones disponibles.

---

## 🧩 Desarrollo de Plugins

XPE Bot está diseñado para ser fácilmente extensible mediante un sistema de plugins modulares. Cada plugin es un archivo JavaScript que registra uno o más comandos.

### Estructura de un Plugin

Un plugin básico tiene la siguiente estructura. Primero, se exporta una función por defecto que recibe la función `registerCommand` como argumento. Dentro de esta función, se llama a `registerCommand` con el nombre del comando, la función que lo ejecuta, y un objeto con opciones.

```javascript
export default function miPlugin(registerCommand) {
    registerCommand(
        'micomando',
        async (sock, message, args, fullArgs, bot) => {
            // Tu código aquí
            await sock.sendMessage(message.key.remoteJid, {
                text: '¡Hola desde mi plugin!'
            });
        },
        {
            description: 'Descripción del comando',
            category: 'Utilidades',
            usage: '!micomando',
            aliases: ['mc', 'mi-cmd']
        }
    );
}
```

### Opciones de Registro

El objeto de opciones permite configurar el comportamiento del comando. `description` es una breve explicación de lo que hace el comando. `category` indica en qué sección del menú aparecerá. `usage` muestra el formato correcto del comando. `aliases` define nombres alternativos para el mismo comando. Las opciones `ownerOnly`, `adminOnly`, `groupOnly` y `privateOnly` restringen quién puede usar el comando y en qué contexto.

### Categorías Disponibles

Los plugins deben colocarse en la carpeta correspondiente a su categoría. Las categorías disponibles son `_admin` para comandos de administración de grupos como banear usuarios y configurar bienvenida, `_ai` para comandos de inteligencia artificial como chat y generación de código, `_owner` para comandos exclusivos del propietario como reinicio y detención, `_utils` para utilidades generales como ping y ayuda, `_media` para comandos multimedia como creación de stickers, `_entertainment` para comandos de entretenimiento y juegos, y `_downloads` para comandos de descarga de contenido de redes sociales.

### Instalación de Plugins

Para instalar un nuevo plugin, simplemente coloca el archivo JavaScript en la carpeta de la categoría correspondiente y reinicia el bot. El plugin se cargará automáticamente y estará disponible inmediatamente.

---

## 🔒 Seguridad

La seguridad es una prioridad en el diseño de XPE Bot. El bot implementa múltiples capas de protección para garantizar un funcionamiento seguro y prevenir accesos no autorizados.

El sistema de permisos restrictivos asegura que los comandos sensibles estén protegidos. Los comandos de owner solo funcionan para el número configurado en `XPE_OWNER_NUMBER`. Los comandos de administrador requieren que el usuario sea administrador del grupo. Todos los comandos pueden configurarse para funcionar solo en grupos o solo en privado según las necesidades.

El aislamiento de sesiones almacena las credenciales de WhatsApp en archivos cifrados dentro de la carpeta `sessions/`. Esta carpeta está incluida en `.gitignore` para prevenir que las credenciales se suban accidentalmente al repositorio.

La validación de entrada sanitiza todos los mensajes entrantes para prevenir inyecciones de código y otros ataques. Los comandos sensibles requieren confirmación antes de ejecutarse, especialmente aquellos que pueden afectar la estabilidad del bot.

Para uso en producción, se recomienda ejecutar el bot en un servidor con firewall configurado, no exponer el puerto del panel web directamente a internet sin HTTPS, cambiar el token de autenticación del panel por uno seguro, mantener las dependencias actualizadas, y revisar regularmente los logs en busca de actividad sospechosa.

---

## 📝 Solución de Problemas

Si experimentas problemas con XPE Bot, aquí encontrarás soluciones a los problemas más comunes.

El error de conexión fallida con código 401 indica que la sesión de WhatsApp fue revocada. Esto puede ocurrir si escaneaste el código QR desde otro dispositivo o si WhatsApp detectó actividad sospechosa. La solución es eliminar la carpeta `sessions/` y reiniciar el bot para generar un nuevo código QR.

Si los comandos de IA no responden, verifica que `OPENAI_API_KEY` esté configurada correctamente en el archivo `.env` y que la clave sea válida. También verifica que tengas crédito disponible en tu cuenta de OpenAI.

Si el panel web no carga, verifica que el puerto configurado en `PANEL_PORT` no esté siendo usado por otra aplicación. Ejecuta `lsof -i :3000` en Linux o `netstat -ano | findstr :3000` en Windows para verificar.

Si el bot no responde a comandos, verifica que el bot esté conectado revisando el estado en el panel web o los logs. Asegúrate de usar el prefijo correcto configurado en `XPE_COMMAND_PREFIX`. Verifica que el comando exista ejecutando `!menu`.

---

## 🤝 Contribuir

XPE Bot es un proyecto de código abierto y las contribuciones son bienvenidas. Puedes contribuir de varias maneras, desde reportar bugs hasta enviar pull requests con nuevas funcionalidades.

Para reportar un bug, utiliza el sistema de issues de GitHub con una descripción detallada del problema, los pasos para reproducirlo, y la información de tu sistema operativo y versión de Node.js.

Para proponer nuevas funcionalidades, también utiliza el sistema de issues con una descripción clara de la funcionalidad deseada, el caso de uso, y si es posible, una implementación básica.

Si deseas contribuir código, haz un fork del repositorio, crea una rama para tu funcionalidad, desarrolla los cambios, y envía un pull request. Asegúrate de seguir el estilo de código existente y agregar pruebas para nuevas funcionalidades.

---

## 📄 Licencia

XPE Bot está licenciado bajo la licencia MIT. Esto significa que puedes usar, modificar y distribuir el software libremente, tanto para proyectos personales como comerciales, con la única condición de incluir el aviso de copyright en todas las copias o partes sustanciales del software.

---

## 📞 Contacto

Para soporte, sugerencias o consultas comerciales, puedes contactarnos a través de los siguientes canales. El soporte comunitario está disponible a través de issues en GitHub. Para consultas urgentes, puedes enviar un mensaje de WhatsApp al número del owner configurado en el bot.

---

<div align="center">

**Desarrollado con ❤️ por XPE Systems**

*Automatización profesional de WhatsApp*

</div>
