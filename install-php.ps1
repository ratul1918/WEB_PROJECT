# PHP Installation Script for Windows
# Run this script as Administrator

param(
    [string]$PHPVersion = "8.2.18",
    [string]$InstallPath = "C:\php"
)

Write-Host "PHP Installation Script" -ForegroundColor Green
Write-Host "======================="
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "WARNING: This script should ideally be run as Administrator for PATH modifications" -ForegroundColor Yellow
}

# Step 1: Download PHP
Write-Host "Step 1: Downloading PHP $PHPVersion..." -ForegroundColor Cyan
$url = "https://windows.php.net/downloads/releases/php-$PHPVersion-nts-Win32-vs16-x64.zip"
$zipPath = "$env:TEMP\php-$PHPVersion.zip"

try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing
    Write-Host "✓ Downloaded successfully" -ForegroundColor Green
}
catch {
    Write-Host "✗ Download failed. Please manually download from:" -ForegroundColor Red
    Write-Host "  $url" -ForegroundColor Yellow
    Write-Host "  Extract to: $InstallPath" -ForegroundColor Yellow
    exit 1
}

# Step 2: Create installation directory
Write-Host ""
Write-Host "Step 2: Creating PHP directory..." -ForegroundColor Cyan
if (Test-Path $InstallPath) {
    Write-Host "✓ Directory $InstallPath already exists" -ForegroundColor Green
} else {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    Write-Host "✓ Created $InstallPath" -ForegroundColor Green
}

# Step 3: Extract PHP
Write-Host ""
Write-Host "Step 3: Extracting PHP..." -ForegroundColor Cyan
try {
    Expand-Archive -Path $zipPath -DestinationPath $InstallPath -Force
    Write-Host "✓ Extracted successfully" -ForegroundColor Green
    Remove-Item $zipPath -Force
}
catch {
    Write-Host "✗ Extraction failed: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Copy php.ini
Write-Host ""
Write-Host "Step 4: Configuring PHP..." -ForegroundColor Cyan
if (Test-Path "$InstallPath\php.ini-production") {
    Copy-Item "$InstallPath\php.ini-production" "$InstallPath\php.ini" -Force
    Write-Host "✓ Created php.ini" -ForegroundColor Green
}

# Step 5: Add to PATH
Write-Host ""
Write-Host "Step 5: Adding PHP to system PATH..." -ForegroundColor Cyan
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
if ($currentPath -notlike "*$InstallPath*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$InstallPath", "Machine")
    Write-Host "✓ Added to system PATH" -ForegroundColor Green
    Write-Host "  Note: Please restart PowerShell or your terminal for PATH changes to take effect" -ForegroundColor Yellow
} else {
    Write-Host "✓ PHP path already in system PATH" -ForegroundColor Green
}

# Step 6: Verify installation
Write-Host ""
Write-Host "Step 6: Verifying installation..." -ForegroundColor Cyan
$phpExe = "$InstallPath\php.exe"
if (Test-Path $phpExe) {
    Write-Host "✓ PHP executable found" -ForegroundColor Green
    & $phpExe -v
} else {
    Write-Host "✗ PHP executable not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Close and reopen PowerShell/Command Prompt"
Write-Host "2. Navigate to the backend directory:"
Write-Host "   cd 'C:\Users\hp\Desktop\UIU-Talent-Showcase-main\UIU-Talent-Showcase-main\backend'"
Write-Host "3. Start the PHP server:"
Write-Host "   php -S localhost:8000"
Write-Host ""
