#!/bin/bash

# XPE Bot - GitHub Setup and Push Script
# Este script prepara y sube el código a GitHub

echo "🚀 XPE Bot - GitHub Setup Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_warning "Git no inicializado. Inicializando..."
    git init
    git config user.email "dev@xpe.bot"
    git config user.name "XPE Bot Development Team"
fi

print_status "Git inicializado correctamente"

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
    print_warning "No hay cambios para subir. Usa 'git add .' y 'git commit' primero."
else
    print_status "Cambios detectados"
fi

echo ""
echo "📋 Pasos para subir a GitHub:"
echo ""
echo "1. Crear repositorio en GitHub:"
echo "   - Ve a: https://github.com/new"
echo "   - Repository name: xpe-bot"
echo "   - Description: Professional WhatsApp Automation Bot with AI Assistant"
echo "   - Public: ✓"
echo "   - NO inicialices con README"
echo "   - Click: Create repository"
echo ""
echo "2. Conectar y subir:"
echo ""
echo "   Copia y pega estos comandos:"
echo ""
echo "   ------------------------------------------------------------"
echo "   git remote add origin https://github.com/TU_USUARIO/xpe-bot.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo "   ------------------------------------------------------------"
echo ""
echo "3. Para crear Release automático:"
echo "   - Ve a: https://github.com/TU_USUARIO/xpe-bot/releases/new"
echo "   - Tag: v1.0.0"
echo "   - Release title: XPE Bot v1.0.0"
echo "   - Description: First stable release"
echo "   - Click: Publish release"
echo ""
echo "4. El panel .exe se compilará automáticamente vía GitHub Actions"
echo "   cuando crees un release."
echo ""
print_status "¡Listo! Sigue los pasos arriba para subir a GitHub."
