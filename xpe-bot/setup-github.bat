@echo off
REM XPE Bot - GitHub Setup Script for Windows
REM Este script prepara y sube el codigo a GitHub

echo ==========================================
echo 🚀 XPE Bot - GitHub Setup Script
echo ==========================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo [!] Git no inicializado. Inicializando...
    git init
    git config user.email "dev@xpe.bot"
    git config user.name "XPE Bot Development Team"
    echo [✓] Git inicializado correctamente
) else (
    echo [✓] Git ya inicializado
)

echo.
echo 📋 Pasos para subir a GitHub:
echo.
echo 1. Crear repositorio en GitHub:
echo    - Ve a: https://github.com/new
echo    - Repository name: xpe-bot
echo    - Description: Professional WhatsApp Automation Bot with AI Assistant
echo    - Public: ☑
echo    - NO inicialices con README
echo    - Click: Create repository
echo.
echo 2. Conectar y subir:
echo.
echo    Copia y pega estos comandos:
echo.
echo    ================================================
echo    git remote add origin https://github.com/TU_USUARIO/xpe-bot.git
echo    git branch -M main
echo    git push -u origin main
echo    ================================================
echo.
echo 3. Para crear Release automatico:
echo    - Ve a: https://github.com/TU_USUARIO/xpe-bot/releases/new
echo    - Tag: v1.0.0
echo    - Release title: XPE Bot v1.0.0
echo    - Description: First stable release
echo    - Click: Publish release
echo.
echo 4. El panel .exe se compilara automaticamente via GitHub Actions
echo    cuando crees un release.
echo.
echo [✓] ¡Listo! Sigue los pasos arriba para subir a GitHub.
echo.

pause
