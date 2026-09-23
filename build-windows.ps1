# Navitronix Studio - Windows PowerShell Build Script
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   Navitronix Studio - Windows Electron + C# Build Tool  " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BitmapApiDir = Join-Path $ScriptDir "..\bitmapapi"
$ResourcesBinDir = Join-Path $ScriptDir "resources\bin"

if (-not (Test-Path $ResourcesBinDir)) {
    New-Item -ItemType Directory -Force -Path $ResourcesBinDir | Out-Null
}

# 1. Check prerequisites
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Error "[ERROR] .NET SDK is not installed or not in PATH. Please install .NET 8 SDK."
    exit 1
}

$pkgMgr = "pnpm"
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Warning "[WARN] pnpm not found, falling back to npm."
    $pkgMgr = "npm"
}

# 2. Build .NET 8 Bitmap Engine
Write-Host "`n[1/4] Publishing C# Bitmap Engine (.NET 8 self-contained win-x64)..." -ForegroundColor Yellow
$csprojPath = Join-Path $BitmapApiDir "BitmapFontApi.csproj"
if (Test-Path $csprojPath) {
    dotnet publish $csprojPath -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true /p:IncludeNativeLibrariesForSelfExtract=true -o $ResourcesBinDir
    if ($LASTEXITCODE -ne 0) {
        Write-Error "[ERROR] C# compilation failed!"
        exit 1
    }
    $iconsSrc = Join-Path $BitmapApiDir "icons.ttf"
    $iconsDst = Join-Path $ResourcesBinDir "icons.ttf"
    if (Test-Path $iconsSrc) {
        Copy-Item -Path $iconsSrc -Destination $iconsDst -Force
    }
} elseif (-not (Test-Path (Join-Path $ResourcesBinDir "BitmapFontApi.exe"))) {
    Write-Error "[ERROR] BitmapFontApi.csproj not found at $BitmapApiDir and BitmapFontApi.exe not found in resources\bin!"
    exit 1
}
Write-Host "[OK] BitmapFontApi.exe ready in $ResourcesBinDir" -ForegroundColor Green

# 3. Install Node.js Dependencies
Write-Host "`n[2/4] Installing UI dependencies with $pkgMgr..." -ForegroundColor Yellow
Push-Location $ScriptDir
& $pkgMgr install
if ($LASTEXITCODE -ne 0) {
    Write-Error "[ERROR] Failed to install npm dependencies!"
    Pop-Location
    exit 1
}

# 4. Build Vite React Frontend
Write-Host "`n[3/4] Building Vite React frontend..." -ForegroundColor Yellow
& $pkgMgr run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "[ERROR] Vite build failed!"
    Pop-Location
    exit 1
}

# 5. Package Windows App
Write-Host "`n[4/4] Packaging Electron Windows App (.exe)..." -ForegroundColor Yellow
npx electron-builder --win
if ($LASTEXITCODE -ne 0) {
    Write-Error "[ERROR] Electron packaging failed!"
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "`n=========================================================" -ForegroundColor Green
Write-Host "[SUCCESS] Windows Application packaged successfully!" -ForegroundColor Green
Write-Host "Output located in: $ScriptDir\dist-electron\" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
