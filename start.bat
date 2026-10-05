@echo off
setlocal EnableExtensions
title AgriMind AI Launcher

echo ========================================================
echo                 AGRIMIND AI - SMART LAUNCHER
echo ========================================================
echo.

:: -----------------------------------------------------------------------------
:: Step 1: Detect Project Root Directory
:: -----------------------------------------------------------------------------
set "TARGET_DIR="

if exist "%~dp0package.json" set "TARGET_DIR=%~dp0"
if not defined TARGET_DIR if exist "%~dp0AgriMind-AI-main\package.json" set "TARGET_DIR=%~dp0AgriMind-AI-main"
if not defined TARGET_DIR if exist "%~dp0..\package.json" set "TARGET_DIR=%~dp0.."
if not defined TARGET_DIR if exist "%CD%\package.json" set "TARGET_DIR=%CD%"
if not defined TARGET_DIR if exist "%CD%\AgriMind-AI-main\package.json" set "TARGET_DIR=%CD%\AgriMind-AI-main"

if not defined TARGET_DIR (
    echo [ERROR] Could not find package.json.
    echo Please make sure this launcher is placed inside or next to the AgriMind-AI folder.
    echo.
    pause
    exit /b 1
)

:: Strip trailing backslash if present
if "%TARGET_DIR:~-1%"=="\" set "TARGET_DIR=%TARGET_DIR:~0,-1%"

cd /d "%TARGET_DIR%"
echo [INFO] Working directory: "%TARGET_DIR%"
echo.

:: -----------------------------------------------------------------------------
:: Step 2: Ensure Node.js (version >= 20) is Available
:: -----------------------------------------------------------------------------
set "PORTABLE_NODE_DIR=%TARGET_DIR%\.tools\node\node-v20.18.0-win-x64"

:: 2a. Check if local portable Node.js already exists
if exist "%PORTABLE_NODE_DIR%\node.exe" (
    echo [INFO] Using local portable Node.js from .tools\node
    set "PATH=%PORTABLE_NODE_DIR%;%PATH%"
    goto :node_is_ready
)

:: 2b. Check if system Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 goto :download_portable_node

:: 2c. Check system Node.js version
set "FULL_VER="
for /f %%a in ('node -v 2^>nul') do set "FULL_VER=%%a"
if not defined FULL_VER goto :download_portable_node

set "VER_NO_V=%FULL_VER:~1%"
for /f "delims=." %%x in ("%VER_NO_V%") do set "NODE_MAJOR=%%x"
if %NODE_MAJOR% LSS 20 (
    echo [WARN] System Node.js is outdated: %FULL_VER%. AgriMind AI requires Node.js 20 or newer.
    goto :download_portable_node
)

echo [OK] Detected system Node.js: %FULL_VER%
goto :node_is_ready

:download_portable_node
echo.
echo ========================================================
echo  [AUTO SETUP] Node.js 20+ was not found on this device.
echo  Downloading portable Node.js v20 LTS automatically...
echo  (No installer or administrator rights required)
echo ========================================================
echo.

set "TOOLS_DIR=%TARGET_DIR%\.tools\node"
set "NODE_ZIP=%TOOLS_DIR%\node-v20.18.0-win-x64.zip"

if not exist "%TOOLS_DIR%" mkdir "%TOOLS_DIR%"

echo [1/2] Downloading Node.js v20.18.0 [~28 MB]...
where curl.exe >nul 2>nul
if %ERRORLEVEL% equ 0 (
    curl.exe -L --progress-bar -o "%NODE_ZIP%" "https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip"
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip', '%NODE_ZIP%')"
)

if not exist "%NODE_ZIP%" (
    echo.
    echo [ERROR] Failed to download Node.js automatically.
    echo Please verify your internet connection or install Node.js manually from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [2/2] Extracting portable Node.js...
where tar.exe >nul 2>nul
if %ERRORLEVEL% equ 0 (
    tar.exe -xf "%NODE_ZIP%" -C "%TOOLS_DIR%"
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '%NODE_ZIP%' -DestinationPath '%TOOLS_DIR%' -Force"
)

if exist "%NODE_ZIP%" del /f /q "%NODE_ZIP%"

if not exist "%PORTABLE_NODE_DIR%\node.exe" (
    echo.
    echo [ERROR] Extraction failed. Could not find node.exe.
    pause
    exit /b 1
)

set "PATH=%PORTABLE_NODE_DIR%;%PATH%"
echo [SUCCESS] Portable Node.js configured successfully!

:node_is_ready
echo.

:: -----------------------------------------------------------------------------
:: Step 3: Check Environment Variables File (.env.local)
:: -----------------------------------------------------------------------------
if exist ".env.local" goto :env_ready

if exist ".env.example" (
    echo [INFO] .env.local not found. Creating from .env.example...
    copy ".env.example" ".env.local" >nul
    echo [OK] Created .env.local configuration file.
    echo [NOTE] You can add your free API keys to .env.local anytime.
    goto :env_ready
)

echo [WARN] .env.example not found; skipping .env.local creation.

:env_ready
echo [OK] Configuration file .env.local is ready.
echo.

:: -----------------------------------------------------------------------------
:: Step 4: Check and Install Project Dependencies (node_modules)
:: -----------------------------------------------------------------------------
if exist "node_modules\next\" goto :deps_ready

echo ========================================================
echo  Project dependencies not found.
echo  Downloading all required packages [npm install]...
echo  This may take 1-3 minutes on the first run.
echo ========================================================
echo.

call npm install
if %ERRORLEVEL% equ 0 goto :deps_installed

echo.
echo [WARN] Standard npm install failed. Retrying with --legacy-peer-deps...
call npm install --legacy-peer-deps
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Dependency installation failed.
    echo Please check your internet connection and try running npm install manually.
    echo.
    pause
    exit /b 1
)

:deps_installed
echo.
echo [SUCCESS] All dependencies downloaded and installed!
echo.

:deps_ready
echo [OK] Project dependencies [node_modules] are installed.

:: -----------------------------------------------------------------------------
:: Step 5: Check and Download Multilingual PDF Fonts
:: -----------------------------------------------------------------------------
if exist "public\fonts\NotoSansDevanagari-Regular.ttf" goto :fonts_ready
if exist "scripts\fetch-pdf-fonts.mjs" (
    echo [INFO] Multilingual PDF fonts missing. Downloading automatically...
    call node scripts/fetch-pdf-fonts.mjs
)

:fonts_ready

:: -----------------------------------------------------------------------------
:: Step 6: Background Browser Auto-Opener (Waits until server is responsive)
:: -----------------------------------------------------------------------------
start "" /min powershell -NoProfile -WindowStyle Hidden -Command "$url='http://localhost:3000'; for ($i=0; $i -lt 40; $i++) { try { $req = [System.Net.WebRequest]::Create($url); $req.Timeout = 1500; $res = $req.GetResponse(); if ($res) { $res.Close(); break } } catch { Start-Sleep -Seconds 1 } }; Start-Process $url"

:: -----------------------------------------------------------------------------
:: Step 7: Start Development Server
:: -----------------------------------------------------------------------------
echo.
echo ========================================================
echo               AGRIMIND AI IS STARTING!
echo ========================================================
echo  Local Address : http://localhost:3000
echo  The browser will open automatically once ready.
echo  To stop the server, press Ctrl + C in this window.
echo ========================================================
echo.

call npm run dev
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] AgriMind AI stopped with exit code %ERRORLEVEL%.
    pause
)
