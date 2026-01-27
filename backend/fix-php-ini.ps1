# Fix PHP Upload Limits - Windows
# This script modifies C:\php\php.ini to allow large file uploads
# Run as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHP Upload Limits Configurator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$phpIniPath = "C:\php\php.ini"

# Check if php.ini exists
if (!(Test-Path $phpIniPath)) {
    Write-Host "ERROR: php.ini not found at $phpIniPath" -ForegroundColor Red
    Write-Host "Please update the path in this script to match your PHP installation." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found php.ini at: $phpIniPath" -ForegroundColor Green
Write-Host ""

# Create backup
$backupPath = "$phpIniPath.backup_" + (Get-Date -Format "yyyyMMdd_HHmmss")
Copy-Item $phpIniPath $backupPath -Force
Write-Host "Backup created: $backupPath" -ForegroundColor Green
Write-Host ""

# Read current file
$content = Get-Content $phpIniPath -Raw

# Define settings to update
$settings = @{
    'upload_max_filesize' = '500M'
    'post_max_size' = '550M'
    'memory_limit' = '1024M'
    'max_execution_time' = '600'
    'max_input_time' = '600'
    'file_uploads' = 'On'
    'max_file_uploads' = '20'
}

Write-Host "Updating settings:" -ForegroundColor Yellow

foreach ($key in $settings.Keys) {
    $value = $settings[$key]
    
    # Pattern to match the setting (commented or uncommented)
    $pattern = "(?m)^;?\s*$key\s*=\s*.+$"
    
    if ($content -match $pattern) {
        # Setting exists, update it
        $content = $content -replace $pattern, "$key = $value"
        Write-Host "  ✓ Updated $key = $value" -ForegroundColor Green
    } else {
        # Setting doesn't exist, add it
        # Add under [PHP] section or at the end
        if ($content -match "(?m)^\[PHP\]") {
            $content = $content -replace "(?m)^(\[PHP\])", "`$1`r`n$key = $value"
        } else {
            $content += "`r`n$key = $value"
        }
        Write-Host "  ✓ Added $key = $value" -ForegroundColor Cyan
    }
}

# Write updated content
Set-Content $phpIniPath $content -NoNewline

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Configuration Updated Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Show updated values
Write-Host "Current PHP settings:" -ForegroundColor Cyan
Write-Host ""

$currentSettings = php -r "echo 'upload_max_filesize: ' . ini_get('upload_max_filesize') . PHP_EOL; echo 'post_max_size: ' . ini_get('post_max_size') . PHP_EOL; echo 'memory_limit: ' . ini_get('memory_limit') . PHP_EOL; echo 'max_execution_time: ' . ini_get('max_execution_time') . PHP_EOL; echo 'max_input_time: ' . ini_get('max_input_time') . PHP_EOL; echo 'file_uploads: ' . ini_get('file_uploads') . PHP_EOL;"
Write-Host $currentSettings

Write-Host ""
Write-Host "IMPORTANT: Restart your PHP server or Apache for changes to take effect!" -ForegroundColor Yellow
Write-Host ""
Write-Host "To start the development server with these settings:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  .\start-server.ps1" -ForegroundColor White
Write-Host ""
