@echo off
setlocal enabledelayedexpansion

NET SESSION >NUL 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo Este desinstalador requiere permisos de Administrador.
    echo.
    goto ELEVATE
)
goto START

:ELEVATE
    set "VBSCRIPT=%TEMP%\elevate.vbs"
    echo Set UAC = CreateObject^("Shell.Application"^) > "%VBSCRIPT%"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%VBSCRIPT%"
    start "" "%VBSCRIPT%"
    exit /b

:START
echo ==============================
echo Desinstalador de EtherUtils
echo ==============================

set /p CONFIRM="¿Desea eliminar EtherUtils y todos sus archivos? (S/N): "
if /I not "%CONFIRM%"=="S" (
    echo Operación cancelada.
    pause
    exit /b
)

echo Eliminando directorios de instalación...
if exist "%LOCALAPPDATA%\EtherUtils\" (
    echo Eliminando EtherUtils de %LOCALAPPDATA%\EtherUtils...
    rd /s /q "%LOCALAPPDATA%\EtherUtils\" >nul 2>&1
    echo Directorio de EtherUtils eliminado
) else (
    echo No se encontró la carpeta de instalación en %LOCALAPPDATA%\EtherUtils
)

:: También eliminar la instalación anterior en Program Files por si existe
if exist "C:\Program Files\EtherUtils\" (
    echo Eliminando instalación anterior de C:\Program Files\EtherUtils...
    rd /s /q "C:\Program Files\EtherUtils\" >nul 2>&1
    echo Instalación anterior eliminada
)

if exist "C:\Windows\System32\eth.bat" (
    echo Eliminando comando global 'eth'...
    del /f /q "C:\Windows\System32\eth.bat" >nul 2>&1
    echo Comando 'eth' eliminado
) else (
    echo El comando global 'eth' no existe o ya fue eliminado.
)

echo Limpiando archivos temporales...
if exist "%TEMP%\etherutils.zip" (
    del /f /q "%TEMP%\etherutils.zip" >nul 2>&1
    echo Archivo etherutils.zip eliminado
)

if exist "%TEMP%\node.msi" (
    del /f /q "%TEMP%\node.msi" >nul 2>&1
    echo Archivo node.msi eliminado
)

if exist "%TEMP%\elevate.vbs" (
    del /f /q "%TEMP%\elevate.vbs" >nul 2>&1
)

echo.
echo ========================================
echo EtherUtils ha sido desinstalado correctamente
echo ========================================
echo.
echo Todos los archivos y accesos directos han sido eliminados.
echo.
echo AVISO: Node.js no ha sido eliminado. Si deseas eliminarlo:
echo 1. Ve a "Agregar o quitar programas" 
echo 2. Busca "Node.js" y desinstálalo manualmente
echo.
pause
exit /b