@echo off
setlocal enabledelayedexpansion
title Actualizador de EtherUtils

set SILENT_MODE=0
if "%~1"=="/SILENT" set SILENT_MODE=1

NET SESSION >NUL 2>&1
IF %ERRORLEVEL% NEQ 0 (
    if !SILENT_MODE!==0 echo.& echo Este actualizador requiere permisos de Administrador.& echo.
    goto ELEVATE
)
goto START

:ELEVATE
    set "VBSCRIPT=%TEMP%\elevate.vbs"
    echo Set UAC = CreateObject^("Shell.Application"^) > "%VBSCRIPT%"
    echo UAC.ShellExecute "%~s0", "%1", "", "runas", 1 >> "%VBSCRIPT%"
    start "" "%VBSCRIPT%"
    exit /b

:START
if !SILENT_MODE!==0 (
    echo ==============================
    echo   Actualizador de EtherUtils
    echo ==============================
    echo.
)

set "MANAGER_DIR=%~dp0manager"
set "INSTALL_DIR=%LOCALAPPDATA%\EtherUtils"
set "INSTALLER=%MANAGER_DIR%\installer.bat"
set "UNINSTALLER=%MANAGER_DIR%\uninstaller.bat"
set "TEMP_UPDATE=%TEMP%\etherutils_update.zip"

if not exist "%MANAGER_DIR%" (
    if !SILENT_MODE!==0 echo Error: No se encontro la carpeta "manager" junto al actualizador.& pause
    exit /b 1
)

if !SILENT_MODE!==0 echo Verificando instalación existente...
if exist "%INSTALL_DIR%\" (
    if !SILENT_MODE!==0 echo EtherUtils detectado en "%INSTALL_DIR%".& echo Desinstalando versión anterior...
    call "%UNINSTALLER%" >nul 2>&1
    if !SILENT_MODE!==0 echo Versión anterior desinstalada
)

if !SILENT_MODE!==0 echo Descargando nueva versión de EtherUtils...
powershell -Command "Invoke-WebRequest -Uri 'http://65.109.80.126:20293/pkg/latest/@latest.zip' -OutFile '%TEMP_UPDATE%'" >nul 2>&1
if %errorlevel% neq 0 (
    if !SILENT_MODE!==0 echo Error: No se pudo descargar la nueva versión.& pause
    exit /b 1
)
if !SILENT_MODE!==0 echo Nueva versión descargada

if !SILENT_MODE!==0 echo Ejecutando instalador...
call "%INSTALLER%" >nul 2>&1

if %errorlevel% neq 0 (
    if !SILENT_MODE!==0 echo Error durante la instalación.& pause
    exit /b 1
)
if !SILENT_MODE!==0 echo Nueva versión instalada

if exist "%TEMP_UPDATE%" del /f /q "%TEMP_UPDATE%" >nul 2>&1

if !SILENT_MODE!==0 (
    echo.
    echo ========================================
    echo EtherUtils actualizado con éxito
    echo ========================================
    echo.
    pause
)
exit /b