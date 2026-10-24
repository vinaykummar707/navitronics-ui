@echo off
setlocal enabledelayedexpansion

echo =========================================================
echo    Navitronix Studio - Windows Electron + C# Build Tool
echo =========================================================
echo.

:: 1. Verify Prerequisites
where dotnet >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] .NET 8 SDK not found in PATH!
    echo Please install .NET 8 SDK from https://dotnet.microsoft.com/download
    exit /b 1
)

where pnpm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] pnpm not found, falling back to npm...
    set PKG_MGR=npm
) else (
    set PKG_MGR=pnpm
)

:: 2. Publish .NET 8 Bitmap API Sidecar as Self-Contained Win-x64
echo [1/4] Publishing C# Bitmap Engine (.NET 8 self-contained win-x64)...
if exist "%~dp0..\bitmapapi\BitmapFontApi.csproj" (
    dotnet publish "%~dp0..\bitmapapi\BitmapFontApi.csproj" -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true /p:IncludeNativeLibrariesForSelfExtract=true -o "%~dp0resources\bin"
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to compile C# Bitmap API!
        exit /b 1
    )
    if exist "%~dp0..\bitmapapi\icons.ttf" (
        copy /Y "%~dp0..\bitmapapi\icons.ttf" "%~dp0resources\bin\icons.ttf" >nul
    )
) else (
    echo [WARN] ../bitmapapi not found. Checking if resources\bin\BitmapFontApi.exe already exists...
    if not exist "%~dp0resources\bin\BitmapFontApi.exe" (
        echo [ERROR] BitmapFontApi.exe not found in resources\bin!
        exit /b 1
    )
)

echo [OK] BitmapFontApi.exe ready in resources\bin
echo.

:: 3. Install Node.js Dependencies
echo [2/4] Installing UI dependencies with %PKG_MGR%...
cd "%~dp0"
call %PKG_MGR% install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Dependency installation failed!
    exit /b 1
)

:: 4. Build Vite React Frontend
echo [3/4] Building Vite React frontend...
call %PKG_MGR% run build:electron-web
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vite build failed!
    exit /b 1
)

:: 5. Package Electron Windows App (.exe)
echo [4/4] Packaging Electron Windows Installer (.exe)...
call npx electron-builder --win
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Electron packaging failed!
    exit /b 1
)

echo.
echo =========================================================
echo [SUCCESS] Windows App built successfully!
echo Installer and portable .exe are in:
echo   %~dp0dist-electron\
echo =========================================================
pause
