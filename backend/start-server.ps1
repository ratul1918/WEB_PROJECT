# UIU Talent Showcase - Start Backend Server with Increased Upload Limits
# This script starts the PHP built-in server with proper file upload configuration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "UIU Talent Showcase - Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
$backendPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $backendPath

Write-Host "Starting PHP server with increased upload limits..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  - Max Upload Size: 500 MB" -ForegroundColor White
Write-Host "  - Max Post Size: 500 MB" -ForegroundColor White
Write-Host "  - Memory Limit: 512 MB" -ForegroundColor White
Write-Host "  - Max Execution Time: 600 seconds" -ForegroundColor White
Write-Host ""
Write-Host "File Size Limits by Type:" -ForegroundColor Green
Write-Host "  - Video: 500 MB" -ForegroundColor White
Write-Host "  - Audio: 100 MB" -ForegroundColor White
Write-Host "  - Blog Images: 50 MB" -ForegroundColor White
Write-Host ""
Write-Host "Server URL: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start PHP server with custom configuration
# CRITICAL: post_max_size must be >= upload_max_filesize
# memory_limit should be significantly higher than post_max_size
php -S localhost:8000 `
    -d upload_max_filesize=500M `
    -d post_max_size=550M `
    -d memory_limit=1024M `
    -d max_execution_time=600 `
    -d max_input_time=600 `
    -d file_uploads=On `
    -d max_file_uploads=20
