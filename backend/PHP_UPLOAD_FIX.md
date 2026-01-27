# PHP Upload Configuration Fix

## Problem
File uploads failing with "file exceeds server limit" error even for small files (2.73 MB), despite intended 500 MB limit.

## Root Cause
PHP configuration limits (upload_max_filesize, post_max_size) are too low and not being applied correctly.

---

## Step-by-Step Fix

### Step 1: Identify Active PHP Configuration

Run the check script to see current PHP settings:

```bash
cd backend
php check-config.php
```

Or view full PHP info in browser:
```
http://localhost:8000/phpinfo.php
```

Look for:
- **Loaded Configuration File**: Path to active php.ini
- **upload_max_filesize**: Current limit
- **post_max_size**: Current limit
- **memory_limit**: Current limit

### Step 2: Locate Your php.ini File

The `check-config.php` script will show the path. Common locations:

**Windows:**
- `C:\php\php.ini`
- `C:\xampp\php\php.ini`
- `C:\wamp\bin\php\php8.x.x\php.ini`
- Where PHP is installed + `\php.ini`

**To find it manually:**
```powershell
php --ini
```

Output will show:
```
Configuration File (php.ini) Path: C:\php
Loaded Configuration File:         C:\php\php.ini
```

### Step 3: Edit php.ini File

Open the php.ini file with administrator privileges and update these values:

```ini
; Enable file uploads
file_uploads = On

; Maximum allowed size for uploaded files
upload_max_filesize = 500M

; Maximum size of POST data (MUST be >= upload_max_filesize)
post_max_size = 550M

; Maximum amount of memory a script may consume (MUST be >= post_max_size)
memory_limit = 1024M

; Maximum execution time (10 minutes for large uploads)
max_execution_time = 600

; Maximum time to parse input data
max_input_time = 600

; Maximum number of files that can be uploaded
max_file_uploads = 20
```

**CRITICAL RULES:**
- `post_max_size` ≥ `upload_max_filesize`
- `memory_limit` ≥ `post_max_size`
- Use same unit (M for megabytes)

### Step 4: Verify Upload Directory

Ensure the uploads directory exists and is writable:

```powershell
# From backend directory
if (!(Test-Path "uploads")) { New-Item -ItemType Directory -Path "uploads" }
icacls uploads /grant Everyone:F
```

Or check permissions via script:
```bash
php check-config.php
```

### Step 5: Restart PHP Server

**If using built-in PHP server:**

Stop current server (Ctrl+C) and restart using the provided script:

```powershell
cd backend
.\start-server.ps1
```

This script automatically sets all limits via command-line flags.

**If using Apache:**

Restart Apache service:
```powershell
# XAMPP
C:\xampp\apache_stop.bat
C:\xampp\apache_start.bat

# Or Windows Service
Restart-Service -Name "Apache2.4"
```

**If using WAMP:**

Right-click WAMP tray icon → Restart All Services

### Step 6: Verify Configuration

After restarting, check that limits are applied:

```bash
cd backend
php check-config.php
```

Expected output:
```json
{
    "current_settings": {
        "upload_max_filesize": "500M",
        "post_max_size": "550M",
        "memory_limit": "1024M",
        "max_execution_time": "600",
        "file_uploads": "Enabled"
    }
}
```

### Step 7: Test Upload

Try uploading a test file via the application. If it fails, check the error diagnostics returned.

---

## Alternative: Use Built-in Server with Flags

If you cannot modify php.ini (shared hosting, permissions), use the provided PowerShell script:

```powershell
cd backend
.\start-server.ps1
```

This bypasses php.ini by setting limits via command-line:
```bash
php -S localhost:8000 \
    -d upload_max_filesize=500M \
    -d post_max_size=550M \
    -d memory_limit=1024M \
    -d max_execution_time=600 \
    -d max_input_time=600 \
    -d file_uploads=On
```

---

## Enhanced Error Diagnostics

The backend now returns detailed error information when uploads fail:

```json
{
    "error": "File exceeds PHP upload_max_filesize limit (2M). Required: 500 MB for video files.",
    "diagnostics": {
        "error_code": 1,
        "message": "...",
        "php_limits": {
            "upload_max_filesize": "2M",
            "post_max_size": "8M",
            "memory_limit": "128M"
        },
        "required_limit": "500 MB",
        "file_size": "2.73 MB"
    }
}
```

**Error Codes:**
- `1` (UPLOAD_ERR_INI_SIZE): File exceeds `upload_max_filesize`
- `2` (UPLOAD_ERR_FORM_SIZE): File exceeds `post_max_size`
- `3` (UPLOAD_ERR_PARTIAL): Incomplete upload
- `4` (UPLOAD_ERR_NO_FILE): No file selected
- `6` (UPLOAD_ERR_NO_TMP_DIR): Missing temp directory
- `7` (UPLOAD_ERR_CANT_WRITE): Cannot write to disk
- `8` (UPLOAD_ERR_EXTENSION): PHP extension blocked upload

---

## Troubleshooting

### Issue: "File exceeds upload_max_filesize limit (2M)"

**Cause:** php.ini not updated or not loaded

**Fix:**
1. Verify you edited the correct php.ini file (run `php --ini`)
2. Restart PHP/Apache after editing
3. Use `start-server.ps1` to bypass php.ini

### Issue: Uploads work in start-server.ps1 but not Apache

**Cause:** Apache uses different php.ini

**Fix:**
1. Find Apache's php.ini: `http://localhost/phpinfo.php`
2. Edit the Apache-specific php.ini
3. Restart Apache

### Issue: "post_max_size exceeded"

**Cause:** `post_max_size` < file size

**Fix:** Increase `post_max_size` to at least 550M (higher than `upload_max_filesize`)

### Issue: "Memory limit exhausted"

**Cause:** `memory_limit` too low

**Fix:** Set `memory_limit = 1024M` (higher than `post_max_size`)

### Issue: Upload still failing with correct limits

**Possible causes:**
1. Frontend file size check rejecting file
2. Nginx/Apache proxy timeout
3. Disk space full
4. Upload directory not writable
5. Antivirus blocking uploads

**Check:**
```bash
php check-config.php
```

Review:
- `upload_tmp_dir_writable`: Must be true
- `uploads_dir_writable`: Must be true
- Disk space: `dir` (check free space)

---

## File Size Limits by Content Type

Backend enforces these limits after PHP accepts the upload:

- **Video**: 500 MB
- **Audio**: 100 MB  
- **Blog (images)**: 50 MB

Frontend validates before uploading to provide faster feedback.

---

## Quick Reference

**Recommended Settings:**
```ini
file_uploads = On
upload_max_filesize = 500M
post_max_size = 550M
memory_limit = 1024M
max_execution_time = 600
max_input_time = 600
max_file_uploads = 20
```

**Check current settings:**
```bash
php -r "echo ini_get('upload_max_filesize');"
php -r "echo ini_get('post_max_size');"
php -r "echo ini_get('memory_limit');"
```

**Test file upload:**
1. Start server: `.\start-server.ps1`
2. Check config: `http://localhost:8000/check-config.php`
3. Upload via app frontend
4. Check error diagnostics if it fails

---

## Files Modified

- `backend/api/posts/create.php` - Enhanced error diagnostics
- `backend/start-server.ps1` - Server startup with correct limits
- `backend/.htaccess` - Apache configuration (if using Apache)
- `backend/.user.ini` - PHP CGI configuration (if supported)
- `backend/check-config.php` - Configuration checker (NEW)
- `backend/phpinfo.php` - Full PHP info viewer (NEW)
