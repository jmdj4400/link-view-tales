# Save Functionality Test Guide

## Overview
This document provides a comprehensive test plan to verify all save functionality across the LinkPeek application.

## Test Environment Setup
1. Open browser DevTools (F12)
2. Go to Console tab to see debug logs
3. Clear console before each test
4. Monitor Network tab for failed requests

## Test Cases

### 1. Profile Settings (/settings/profile)
**Location**: Settings → Profile

**Test Steps**:
1. Navigate to `/settings/profile`
2. Update the following fields:
   - Name (max 100 characters)
   - Bio (max 500 characters) 
   - Avatar URL (valid URL format)
3. Click "Save Changes" button
4. Verify toast notification appears
5. Check console for logs:
   - `ProfileSettings: Starting save...`
   - `ProfileSettings: Save successful`
6. Refresh page and verify changes persisted

**Expected Behavior**:
- Autosave triggers 2 seconds after typing stops
- Manual save button works
- Success toast appears
- Console shows save logs
- Changes persist after refresh

**Common Issues**:
- RLS policy blocking update
- Invalid data format
- User not authenticated

---

### 2. Link Designer (/settings/links)
**Location**: Settings → Links

**Test Steps**:
1. Navigate to `/settings/links`
2. Add new link:
   - Enter title (max 100 chars)
   - Enter destination URL (valid URL)
   - Select category (optional)
3. Click "Add Link"
4. Toggle link active/inactive
5. Open link options (schedule, UTM, etc.)
6. Check console for:
   - `LinksSettings: Toggle successful`

**Expected Behavior**:
- Link added successfully
- Toggle works immediately
- Schedule/UTM/Click limit dialogs save properly
- Links refresh after save

---

### 3. Theme Settings (/settings/theme)
**Location**: Settings → Theme

**Test Steps**:
1. Navigate to `/settings/theme`
2. Change colors in "Colors" tab
3. Change fonts in "Typography" tab
4. Change layout in "Layout" tab
5. Click "Save Theme" button
6. Check console for:
   - `ThemeCustomizer: Starting theme save...`
   - `ThemeCustomizer: Update successful`

**Expected Behavior**:
- Theme preview updates in real-time
- Save button shows loading state
- Success toast appears
- Console shows save logs

---

### 4. Navigation Verification
**Test all navigation buttons**:

**Dashboard**:
- ✅ Profile analytics button → `/analytics`
- ✅ Settings button → `/settings/profile`
- ✅ Sign out button → Signs out user
- ✅ Manage Links → `/settings/links`
- ✅ Manage Leads → `/settings/leads`
- ✅ Customize theme → `/settings/theme`
- ✅ Manage Goals → `/settings/conversions`

**Landing Page Footer**:
- ✅ Features → Scrolls to insights section
- ✅ Pricing → Scrolls to top
- ✅ Sign Up → `/auth`
- ✅ Help Center → `/help`
- ✅ Contact Support → `/contact`
- ✅ API Keys → `/api-keys`
- ✅ Privacy Policy → `/privacy`
- ✅ Terms of Service → `/terms`
- ✅ Cookie Policy → `/cookies`

---

## Debugging

### If saves aren't working:

1. **Check Console Logs**:
   - Look for "Starting save..." log
   - Check for error messages
   - Verify user ID is present

2. **Check Network Tab**:
   - Look for failed POST/PATCH requests
   - Check response status codes
   - Review error messages

3. **Verify Authentication**:
   - Ensure user is logged in
   - Check auth.uid() matches user.id
   - Verify JWT token is valid

4. **Check RLS Policies**:
   - Profiles: `auth.uid() = id`
   - Links: `auth.uid() = user_id`
   - Theme presets: `auth.uid() = user_id`

5. **Validate Input Data**:
   - Check for validation errors
   - Ensure data types match schema
   - Verify length limits

---

## Console Log Reference

### Profile Settings Logs
```
ProfileSettings: Starting save... { userId: "...", profile: {...} }
ProfileSettings: Autosave triggered { data: {...} }
ProfileSettings: Save successful
ProfileSettings: Autosave successful
```

### Links Settings Logs
```
LinksSettings: Toggling link active state { id: "...", currentState: true }
LinksSettings: Toggle successful
```

### Theme Customizer Logs
```
ThemeCustomizer: Starting theme save... { primary_color: "...", ... }
ThemeCustomizer: Updating profile for user ...
ThemeCustomizer: Update successful
ThemeCustomizer: Mutation success, invalidating queries
```

---

## Quick Fix Checklist

If saves fail:
- [ ] User is authenticated
- [ ] Console shows save attempt log
- [ ] No validation errors
- [ ] RLS policies are correct
- [ ] Network request succeeds
- [ ] Data persists after refresh

---

## Known Issues

### ❌ Fixed Issues:
- ✅ Footer navigation dead ends fixed
- ✅ API Documentation link updated to API Keys page
- ✅ Features/Pricing buttons now scroll properly
- ✅ Console logging added for debugging

### ⚠️ Potential Issues:
- Autosave may interfere with manual saves in Profile Settings
- Theme preview might not show all changes in real-time
- Link reordering (drag & drop) not yet implemented

---

## Support

If issues persist after checking all items above:
1. Clear browser cache
2. Try incognito/private browsing
3. Check browser console for errors
4. Review this test document
5. Contact support with console logs
