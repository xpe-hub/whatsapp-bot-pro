@echo off
chcp 65001 >nul 2>&1
title XPE-BOT Control Panel
color 0C
mode con: cols=70 lines=25

cls
echo.
echo    ==========================================
echo    Cargando XPE-BOT Smart Control Panel...
echo    ==========================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0xpe-control.ps1"
pause
