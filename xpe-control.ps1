# XPE-BOT SMART CONTROL PANEL v1.0
# Usa caracteres simples para evitar errores de codificacion

$ErrorActionPreference = "SilentlyContinue"

# Colores
$Red = "Red"
$Cyan = "Cyan"
$Green = "Green"
$Yellow = "Yellow"
$White = "White"
$Gray = "Gray"

function Find-BotPath {
    $desktop = [Environment]::GetFolderPath('Desktop')
    $onedrive = $env:OneDrive
    
    $paths = @(
        "$desktop\bot-xpe-nett-completo",
        "$desktop\bot-xpe-nett-completo-v3-WORKING",
        "$onedrive\Desktop\bot-xpe-nett-completo",
        "$onedrive\Desktop\bot-xpe-nett-completo-v3-WORKING",
        ".\"
    )
    
    foreach ($p in $paths) {
        if (Test-Path "$p\index.js") { return $p }
        if (Test-Path "$p\package.json") { return $p }
    }
    return $null
}

function Show-Logo {
    Clear-Host
    
    Write-Host ""
    Write-Host "    XXXXXX  XXXXXX  X     X  XXXXXX  XXXXXX  X   X  XXXXXX" -ForegroundColor $Red
    Write-Host "    X       X    X  X X X  X       X       X   X  X" -ForegroundColor $Red
    Write-Host "    XXXXX   XXXXX   X   X  XXXXX   XXXXX   X   X  XXXXX" -ForegroundColor $Red
    Write-Host "    X       X  X    X   X  X       X       X   X  X" -ForegroundColor $Red
    Write-Host "    X       X   X   X   X  XXXXXX  XXXXXX  XXXXX  XXXXXX" -ForegroundColor $Red
    Write-Host ""
    Write-Host "    ==============================================" -ForegroundColor $Cyan
    Write-Host "    ==  SMART CONTROL PANEL - V1.0            ==" -ForegroundColor $Cyan
    Write-Host "    ==============================================" -ForegroundColor $Cyan
    Write-Host ""
}

function Get-BotStatus {
    $proc = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -ne $null }
    if ($proc) { return @{ Status = "ONLINE"; PID = $proc[0].Id } }
    return @{ Status = "OFFLINE"; PID = 0 }
}

function Get-BotStats {
    $proc = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -ne $null }
    if ($proc) {
        $ram = [Math]::Round($proc.WorkingSet64 / 1MB, 1)
        $cpu = [Math]::Round($proc.CPU, 2)
        return @{ RAM = $ram; CPU = $cpu }
    }
    return @{ RAM = 0; CPU = 0 }
}

function Start-Bot {
    param($path)
    if ((Get-BotStatus).Status -eq "ONLINE") {
        Write-Host "    [X] El bot ya esta ejecutandose!" -ForegroundColor $Yellow
        return
    }
    Write-Host "    [+] Iniciando XPE-BOT..." -ForegroundColor $Cyan
    Set-Location $path
    Start-Process cmd -ArgumentList "/c npm start" -WindowStyle Normal
    Start-Sleep -Seconds 3
    Write-Host "    [OK] Bot iniciado!" -ForegroundColor $Green
}

function Stop-Bot {
    Write-Host "    [+] Deteniendo XPE-BOT..." -ForegroundColor $Cyan
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 1
    Write-Host "    [OK] Bot detenido!" -ForegroundColor $Green
}

function Restart-Bot {
    param($path)
    Write-Host "    [+] Reiniciando XPE-BOT..." -ForegroundColor $Cyan
    Stop-Bot
    Start-Sleep -Seconds 2
    Start-Bot $path
    Write-Host "    [OK] Bot reiniciado!" -ForegroundColor $Green
}

function Show-Stats {
    Clear-Host
    Show-Logo
    
    Write-Host "    ==============================================" -ForegroundColor $Cyan
    Write-Host "    ==  ESTADISTICAS EN TIEMPO REAL           ==" -ForegroundColor $Cyan
    Write-Host "    ==============================================" -ForegroundColor $Cyan
    Write-Host "    [Presiona Ctrl+C para salir]" -ForegroundColor $Gray
    Write-Host ""
    
    for ($i = 0; $i -lt 30; $i++) {
        $stats = Get-BotStats
        $status = Get-BotStatus
        
        $estado = $status.Status
        $colorEstado = if ($estado -eq "ONLINE") { $Green } else { $Red }
        
        Write-Host "`r    [$estado] RAM: $($stats.RAM) MB  CPU: $($stats.CPU) s   " -ForegroundColor $colorEstado -NoNewline
        Start-Sleep -Seconds 1
    }
}

# Buscar bot
Write-Host "    [+] Buscando XPE-BOT..." -ForegroundColor $Cyan
$botPath = Find-BotPath

if (-not $botPath) {
    Show-Logo
    Write-Host "    [X] No se encontro el bot automaticamente." -ForegroundColor $Red
    Write-Host "    Ingresa la ruta manualmente:" -ForegroundColor $Yellow
    $botPath = Read-Host "    Ruta"
    
    if (-not (Test-Path "$botPath\index.js")) {
        Write-Host "    [X] Error: index.js no encontrado." -ForegroundColor $Red
        exit
    }
}

# Menu principal
do {
    Show-Logo
    Write-Host "    [OK] Ruta: $botPath" -ForegroundColor $Green
    Write-Host ""
    
    $status = Get-BotStatus
    Write-Host "    [ESTADO] " -NoNewline
    Write-Host $status.Status -ForegroundColor $(if ($status.Status -eq "ONLINE") { $Green } else { $Red })
    Write-Host ""
    
    Write-Host "    ==============================================" -ForegroundColor $Cyan
    Write-Host "    ==              MENU PRINCIPAL             ==" -ForegroundColor $Cyan
    Write-Host "    ==============================================" -ForegroundColor $Cyan
    Write-Host "    |                                            |" -ForegroundColor $Cyan
    Write-Host "    |  [1] INICIAR Bot      [4] Ver Stats Live   |" -ForegroundColor $Cyan
    Write-Host "    |  [2] DETENER Bot      [5] Abrir Carpeta    |" -ForegroundColor $Cyan
    Write-Host "    |  [3] REINICIAR Bot    [0] SALIR           |" -ForegroundColor $Cyan
    Write-Host "    |                                            |" -ForegroundColor $Cyan
    Write-Host "    ==============================================" -ForegroundColor $Cyan
    Write-Host ""
    
    $opc = Read-Host "    [XPE-ADMIN] > "
    
    switch ($opc) {
        "1" { Start-Bot $botPath }
        "2" { Stop-Bot }
        "3" { Restart-Bot $botPath }
        "4" { Show-Stats }
        "5" { 
            Write-Host "    [+] Abriendo carpeta..." -ForegroundColor $Cyan
            Start-Process explorer.exe -ArgumentList $botPath
        }
        "0" { 
            Write-Host ""
            Write-Host "    Saliendo... Gracias!" -ForegroundColor $Green
            exit
        }
        default { 
            Write-Host "    [X] Opcion no valida!" -ForegroundColor $Red
            Start-Sleep -Seconds 1
        }
    }
    
    if ($opc -ne "4") { Start-Sleep -Seconds 1 }
    
} while ($true)
