@echo off
setlocal enabledelayedexpansion

NET SESSION >NUL 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo Este instalador requiere permisos de Administrador.
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
echo Instalador de EtherUtils (CLI)
echo ==============================

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js no está instalado.
    set "INSTALLNODE="
    set /p INSTALLNODE=¿Desea instalar Node.js 22.16.1? ^(S/N^): 
    if /I "%INSTALLNODE%"=="S" (
        echo Descargando Node.js 22.16.1...
        powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.16.1/node-v22.16.1-x64.msi' -OutFile '%TEMP%\node.msi'"
        echo Instalando Node.js...
        msiexec /i "%TEMP%\node.msi" /quiet /norestart
    ) else (
        echo No se puede continuar sin Node.js.
        pause
        exit /b
    )
) else (
    echo Node.js y NPM detectados.
)

echo Descargando EtherUtils (latest)...
powershell -Command "Invoke-WebRequest -Uri 'https://etherutils.theindiebrand.es/pkg/latest/@latest.zip' -OutFile '%TEMP%\etherutils.zip'"

echo Descomprimiendo EtherUtils...
set "INSTALL_DIR=%LOCALAPPDATA%\EtherUtils"
if exist "%INSTALL_DIR%\" rd /s /q "%INSTALL_DIR%\"
mkdir "%INSTALL_DIR%\"

powershell -Command "Expand-Archive -Path '%TEMP%\etherutils.zip' -DestinationPath '%INSTALL_DIR%' -Force" 2>nul
if %errorlevel% neq 0 (
    echo Error: No se pudo descomprimir el archivo.
    pause
    exit /b
)

cd "%INSTALL_DIR%\latest"

echo Instalando TypeScript globalmente...
call npm install -g typescript
if %errorlevel% neq 0 (
    echo Error al instalar TypeScript.
    pause
    exit /b
)

echo Instalando dependencias del proyecto...
call npm install
if %errorlevel% neq 0 (
    echo Error al instalar dependencias de npm.
    pause
    exit /b
)

echo Compilando EtherUtils...
if exist "dist\" (
    echo Eliminando compilación anterior...
    rmdir /s /q "dist"
)

echo Recompilando desde fuentes...
call npx tsc
if %errorlevel% neq 0 (
    echo Error en la compilación.
    pause
    exit /b
)

echo Creando comando global 'eth'...
echo @echo off > "C:\Windows\System32\eth.bat"
echo node "%LOCALAPPDATA%\EtherUtils\latest\dist\index.js" %%* >> "C:\Windows\System32\eth.bat"

echo Verificando instalacion...
call eth --version
if %errorlevel% neq 0 (
    echo Error: El comando 'eth --version' falló.
    pause
    exit /b
)

echo.
echo EtherUtils instalado y compilado correctamente.
pause