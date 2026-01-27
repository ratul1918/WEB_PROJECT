# UIU Talent Showcase - File Upload Configuration

## Current Upload Limits

### Backend Configuration
- **Video files**: 500 MB
- **Audio files**: 100 MB  
- **Blog images**: 50 MB

### Server Configuration Files Created

1. **`.htaccess`** - Apache configuration for PHP limits
2. **`.user.ini`** - PHP INI overrides

### Required Steps to Apply Changes

#### For PHP Built-in Server:
```powershell
# Stop current PHP server
# Restart with:
cd backend
php -S localhost:8000 -d upload_max_filesize=500M -d post_max_size=500M -d memory_limit=512M
```

#### For Apache/XAMPP:
1. Restart Apache server
2. Changes in `.htaccess` and `.user.ini` will apply automatically

#### For IIS:
1. Edit `php.ini` file with the values from `.user.ini`
2. Restart IIS

### Next Steps

**Backend**: The upload validation logic needs to be added to `backend/api/posts/create.php`  
**Frontend**: File size validation needs to be added to `frontend/src/components/UploadModal.tsx`

These changes will:
- ✅ Validate file sizes before upload (client-side)
- ✅ Enforce limits on the server (backend)
- ✅ Provide clear error messages
- ✅ Support large files up to 500MB for videos
- ✅ Prevent server crashes from oversized files

### Testing Checklist
- [ ] Upload a video file (test up to 500MB)
- [ ] Upload an audio file (test up to 100MB)
- [ ] Upload a blog image (test up to 50MB)
- [ ] Test exceeding each limit
- [ ] Test multiple consecutive uploads
- [ ] Verify error messages are user-friendly
