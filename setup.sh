#!/bin/bash

# XPE Bot - Script de Instalación Rápida
echo "🤖 XPE Bot - Instalación Local"
echo "================================"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Descárgalo desde: https://nodejs.org/"
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Se requiere Node.js 20+. Versión actual: $(node -v)"
    echo "   Actualiza desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas"

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Creando archivo .env..."
    cp .env.example .env
    echo "✅ Archivo .env creado"
    echo "   📝 Edita .env para configurar tu bot"
else
    echo "✅ Archivo .env ya existe"
fi

# Compilar TypeScript
echo ""
echo "🔨 Compilando TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error compilando TypeScript"
    exit 1
fi

echo "✅ TypeScript compilado exitosamente"

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita el archivo .env con tus configuraciones"
echo "2. Ejecuta: npm start"
echo "3. Escanea el código QR que aparece"
echo ""
echo "🔧 Comandos útiles:"
echo "   npm start     - Iniciar el bot"
echo "   npm run dev   - Modo desarrollo"
echo "   npm run build - Recompilar"
echo ""