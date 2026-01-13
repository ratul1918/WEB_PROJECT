# UIU Talent Showcase - Testing Guide

## 🧪 Quick Test Scenarios

### Test Account Credentials

| Role | Email | Password | User ID |
|------|-------|----------|---------|
| **Viewer** | viewer@uiu.ac.bd | any | viewer-1 |
| **Creator** | rafiur.rahman@uiu.ac.bd | any | creator-1 |
| **Admin** | admin@uiu.ac.bd | any | admin-1 |

> **Note:** Password field accepts any string for mock authentication

---

## 📋 Test Cases

### ✅ Test 1: Viewer Role Permissions

**Steps:**
1. Open the application
2. Login with `viewer@uiu.ac.bd`
3. Verify home page loads

**Expected Results:**
- ✅ Navbar shows: Home, Video, Audio, Blogs, Leaderboard, Profile
- ❌ "Garbage Bin" should NOT appear in navbar
- ✅ Can navigate to all visible portals
- ❌ "Upload" button should NOT appear on any portal
- ❌ "Edit" buttons should NOT appear on any post
- ❌ "Delete" buttons should NOT appear on any post
- ✅ Can view all content, ratings, and leaderboards

**PASS/FAIL:** _____

---

### ✅ Test 2: Creator Role Permissions

**Steps:**
1. Logout (if logged in)
2. Login with `rafiur.rahman@uiu.ac.bd`
3. Navigate to Video Portal

**Expected Results:**
- ✅ Navbar shows: Home, Video, Audio, Blogs, Leaderboard, Profile
- ❌ "Garbage Bin" should NOT appear in navbar
- ✅ "Upload Video" button appears at bottom
- ✅ Video #5 "UI/UX Design Principles" shows Edit & Delete buttons
- ❌ Other videos should NOT show Edit/Delete buttons

**Verify Ownership on All Portals:**

| Portal | Post Title | Should Show Edit/Delete |
|--------|-----------|------------------------|
| Video | #5: UI/UX Design Principles | ✅ YES |
| Video | #1: Introduction to Web Dev | ❌ NO |
| Audio | #6: Entrepreneurship Talk | ✅ YES |
| Audio | #1: Future of Technology | ❌ NO |
| Blog | #5: Building Your Personal Brand | ✅ YES |
| Blog | #1: Evolution of AI | ❌ NO |

**PASS/FAIL:** _____

---

### ✅ Test 3: Admin Role Permissions

**Steps:**
1. Logout
2. Login with `admin@uiu.ac.bd`
3. Check navbar

**Expected Results:**
- ✅ Navbar shows: Home, Video, Audio, Blogs, Leaderboard, **Garbage Bin**, Profile
- ✅ "Garbage Bin" link IS visible
- ✅ Navigate to Video Portal
- ✅ "Upload Video" button appears
- ✅ ALL videos show Edit & Delete buttons

**Verify Admin Access:**
- ✅ Can access Garbage Bin page
- ✅ Garbage Bin shows deleted content
- ✅ Can edit ANY post (regardless of author)
- ✅ Can delete ANY post (regardless of author)

**PASS/FAIL:** _____

---

### ✅ Test 4: Role Badge Display

**Steps:**
1. Login as Viewer → Check profile or navbar
2. Logout and login as Creator → Check badge
3. Logout and login as Admin → Check badge

**Expected Results:**

| Role | Badge Color | Badge Text | Animation |
|------|------------|------------|-----------|
| Viewer | Gray (bg-gray-500) | "Viewer" | None |
| Creator | Orange (bg-orange-500) | "Creator" | None |
| Admin | Red (bg-red-500) | "Admin" | Pulse dot |

**PASS/FAIL:** _____

---

### ✅ Test 5: Upload Button Visibility

**Test Matrix:**

| Role | Video Portal | Audio Portal | Blog Portal |
|------|-------------|-------------|-------------|
| Viewer | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| Creator | ✅ Visible | ✅ Visible | ✅ Visible |
| Admin | ✅ Visible | ✅ Visible | ✅ Visible |

**PASS/FAIL:** _____

---

### ✅ Test 6: Edit/Delete Button Logic

**Login as Creator:**

Test on Video Portal:
- Video #5 (by Rafiur Rahman, authorId: creator-1)
  - ✅ Should show Edit button
  - ✅ Should show Delete button
- Video #1 (by Sarah Johnson, authorId: creator-2)
  - ❌ Should NOT show Edit button
  - ❌ Should NOT show Delete button

**Login as Admin:**
- ALL videos regardless of author
  - ✅ Should show Edit button
  - ✅ Should show Delete button

**PASS/FAIL:** _____

---

### ✅ Test 7: Navigation Protection

**Test Route Access:**

| Route | Viewer | Creator | Admin |
|-------|--------|---------|-------|
| `/` (Home) | ✅ Access | ✅ Access | ✅ Access |
| `/video` | ✅ Access | ✅ Access | ✅ Access |
| `/audio` | ✅ Access | ✅ Access | ✅ Access |
| `/blogs` | ✅ Access | ✅ Access | ✅ Access |
| `/leaderboard` | ✅ Access | ✅ Access | ✅ Access |
| `/profile` | ✅ Access | ✅ Access | ✅ Access |
| `/garbage` | ❌ Redirect | ❌ Redirect | ✅ Access |
| `/login` (when logged in) | Redirect to / | Redirect to / | Redirect to / |

**PASS/FAIL:** _____

---

### ✅ Test 8: Session Persistence

**Steps:**
1. Login as Creator
2. Navigate to Video Portal
3. Refresh the browser (F5)
4. Check if still logged in

**Expected Results:**
- ✅ User remains logged in after refresh
- ✅ Role is preserved
- ✅ Same permissions apply

**PASS/FAIL:** _____

---

### ✅ Test 9: Logout Functionality

**Steps:**
1. Login as any role
2. Click "Logout" button in navbar
3. Verify redirect to login page

**Expected Results:**
- ✅ User is logged out
- ✅ Redirected to `/login`
- ✅ Cannot access protected routes
- ✅ localStorage is cleared
- ✅ Trying to access `/video` redirects to `/login`

**PASS/FAIL:** _____

---

### ✅ Test 10: Garbage Bin Access Control

**Steps:**
1. Login as Viewer
2. Try to access `/garbage` directly

**Expected Results:**
- ❌ Access denied or redirect to home
- ❌ "Garbage Bin" not in navbar

**Steps:**
1. Logout and login as Creator
2. Try to access `/garbage` directly

**Expected Results:**
- ❌ Access denied or redirect to home
- ❌ "Garbage Bin" not in navbar

**Steps:**
1. Logout and login as Admin
2. Navigate to Garbage Bin

**Expected Results:**
- ✅ Can access Garbage Bin
- ✅ "Garbage Bin" visible in navbar
- ✅ Shows deleted content with restore options

**PASS/FAIL:** _____

---

## 🐛 Known Issues / Edge Cases

### Issue 1: Mock Authentication
- Any password works for login
- No actual password validation
- **Future:** Replace with real backend authentication

### Issue 2: Client-Side Only
- Permissions enforced on frontend only
- **Future:** Add backend validation

### Issue 3: No User Registration
- Signup creates Creator role by default
- **Future:** Add role selection or admin approval

---

## 📊 Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Viewer Permissions | ☐ PASS ☐ FAIL | |
| 2. Creator Permissions | ☐ PASS ☐ FAIL | |
| 3. Admin Permissions | ☐ PASS ☐ FAIL | |
| 4. Role Badges | ☐ PASS ☐ FAIL | |
| 5. Upload Buttons | ☐ PASS ☐ FAIL | |
| 6. Edit/Delete Logic | ☐ PASS ☐ FAIL | |
| 7. Navigation Protection | ☐ PASS ☐ FAIL | |
| 8. Session Persistence | ☐ PASS ☐ FAIL | |
| 9. Logout Functionality | ☐ PASS ☐ FAIL | |
| 10. Garbage Bin Access | ☐ PASS ☐ FAIL | |

---

## 🚀 Quick Start Testing

```bash
# 1. Start the development server
npm run dev

# 2. Open browser to localhost:5173

# 3. Test Viewer
#    Login: viewer@uiu.ac.bd
#    Verify: No upload/edit/delete buttons

# 4. Test Creator  
#    Login: rafiur.rahman@uiu.ac.bd
#    Verify: Can edit own posts only

# 5. Test Admin
#    Login: admin@uiu.ac.bd
#    Verify: Can edit all posts + access Garbage Bin
```

---

## ✅ Acceptance Criteria

**System is ready when:**

- [x] All 3 roles function correctly
- [x] Viewers cannot see admin features
- [x] Creators can only edit their own content
- [x] Admins have full access
- [x] Navigation hides restricted links
- [x] Upload buttons only visible to creators/admins
- [x] Edit/Delete respect ownership rules
- [x] Garbage Bin is admin-only
- [x] Role badges display correctly
- [x] Session persists on refresh
- [x] Logout clears session
- [x] No console errors
- [x] No disabled buttons (hidden instead)

---

**Testing Date:** _____________  
**Tester Name:** _____________  
**Overall Result:** ☐ PASS ☐ FAIL

**Comments:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
