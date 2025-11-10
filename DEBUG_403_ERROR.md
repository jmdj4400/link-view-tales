# Debugging 403 Forbidden Errors

## Error Overview
A 403 error means "Forbidden" - the server understood the request but refuses to authorize it. In Supabase, this typically indicates an RLS (Row Level Security) policy is blocking the operation.

## Common Causes

### 1. RLS Policy Mismatch
**Problem**: The `auth.uid()` doesn't match the `id` or `user_id` in the table.

**Check**:
```sql
-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'links', 'theme_presets');
```

**Expected Policies**:
- `profiles`: `auth.uid() = id` for UPDATE
- `links`: `auth.uid() = user_id` for UPDATE
- `theme_presets`: `auth.uid() = user_id` for UPDATE

### 2. User Not Authenticated
**Problem**: The auth token is missing, expired, or invalid.

**Console Logs to Check**:
```javascript
// You should see this in console:
ProfileSettings: Starting save... { userId: "uuid-here", profile: {...} }

// If userId is null or undefined, auth is broken
```

### 3. JWT Token Issues
**Problem**: The JWT token doesn't contain the correct user ID.

**How to Verify**:
1. Open DevTools → Application → Storage → Local Storage
2. Look for `supabase.auth.token`
3. Decode the JWT at jwt.io
4. Verify the `sub` field matches your user ID

### 4. Database Trigger Failures
**Problem**: A database trigger is failing and blocking the update.

**Check for Triggers**:
```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%profile%';
```

---

## Detailed Debugging Steps

### Step 1: Check Console Logs
Open browser DevTools (F12) and look for these logs:

**✅ Good Log (Should See)**:
```
ProfileSettings: Starting save... 
  userId: "29b1e9e2-1c5b-4aab-a42b-4deacd1a7de5"
  profile: { name: "Test", bio: "Test bio", avatar_url: "" }
ProfileSettings: Sending update request... 
  userId: "29b1e9e2-1c5b-4aab-a42b-4deacd1a7de5"
  data: { name: "Test", bio: "Test bio", avatar_url: "" }
ProfileSettings: Save successful
  data: [{ id: "...", name: "Test", ... }]
```

**❌ Bad Log (403 Error)**:
```
ProfileSettings: Save failed 
  error: { code: "42501", message: "new row violates row-level security policy" }
  errorCode: "42501"
  errorMessage: "new row violates row-level security policy"
  userId: "29b1e9e2-1c5b-4aab-a42b-4deacd1a7de5"
```

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Look for requests to Supabase
4. Check the request payload and response

**What to Look For**:
- **Request URL**: Should be to `/rest/v1/profiles?id=eq.{user-id}`
- **Request Method**: PATCH
- **Request Headers**: Should include `Authorization: Bearer {token}`
- **Response Status**: 403
- **Response Body**: Will contain error details

### Step 3: Verify Authentication
Add this temporary logging to ProfileSettings:

```typescript
useEffect(() => {
  const checkAuth = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('Auth Check:', { user, error });
    
    if (user) {
      const { data: session } = await supabase.auth.getSession();
      console.log('Session:', session);
    }
  };
  checkAuth();
}, []);
```

### Step 4: Test RLS Policy Directly
Run this in the Supabase SQL editor:

```sql
-- Test as the authenticated user
SELECT * FROM profiles WHERE id = auth.uid();

-- Try updating
UPDATE profiles 
SET name = 'Test Update' 
WHERE id = auth.uid();

-- Check if the update worked
SELECT * FROM profiles WHERE id = auth.uid();
```

### Step 5: Check for Conflicting Policies
Sometimes multiple policies can conflict:

```sql
-- See all policies on profiles table
SELECT 
  policyname, 
  cmd, 
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'profiles';
```

---

## Quick Fixes

### Fix 1: Disable RLS Temporarily (Testing Only!)
**⚠️ WARNING**: Only do this for testing, never in production!

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Try your save operation. If it works, the issue is definitely RLS policies.

**Don't forget to re-enable**:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Fix 2: Simplify RLS Policy
If the current policy is complex, try a simple one:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create simple policy
CREATE POLICY "Users can update own profile" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Fix 3: Add Logging to RLS Policy
Create a security definer function that logs:

```sql
CREATE OR REPLACE FUNCTION check_profile_access(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE NOTICE 'Checking profile access: user_id=%, profile_id=%', auth.uid(), p_id;
  RETURN auth.uid() = p_id;
END;
$$;

-- Use in policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles 
FOR UPDATE 
USING (check_profile_access(id))
WITH CHECK (check_profile_access(id));
```

### Fix 4: Check User ID Format
Sometimes the user ID format gets corrupted:

```typescript
console.log('User ID Type:', typeof user?.id);
console.log('User ID Value:', user?.id);
console.log('User ID Length:', user?.id?.length);

// Should be:
// Type: string
// Value: "29b1e9e2-1c5b-4aab-a42b-4deacd1a7de5" (36 chars)
// Length: 36
```

---

## Error Code Reference

| Error Code | Meaning | Common Fix |
|------------|---------|------------|
| 42501 | Insufficient privilege | Check RLS policies |
| 23503 | Foreign key violation | Verify related records exist |
| 23505 | Unique constraint violation | Check for duplicate data |
| 42P01 | Table doesn't exist | Check table name |
| PGRST301 | JWT token invalid | Re-authenticate user |

---

## Testing Checklist

Before reporting the issue as unfixable:

- [ ] Console shows user ID is present
- [ ] Console shows update request being sent
- [ ] Network tab shows 403 response
- [ ] Checked RLS policies exist
- [ ] Verified auth token is valid
- [ ] Tested with RLS disabled (worked = RLS issue)
- [ ] Checked for database triggers
- [ ] Verified no conflicting policies
- [ ] Tested direct SQL update in Supabase dashboard

---

## Next Steps

1. **Clear browser cache and cookies**
2. **Sign out and sign back in**
3. **Check console logs with the new detailed logging**
4. **Share the complete error object from console**

**What to Share**:
```javascript
// Copy this from console:
ProfileSettings: Save failed {
  error: { ... },
  errorCode: "...",
  errorMessage: "...",
  errorDetails: { ... },
  userId: "..."
}
```

---

## Known Issues & Solutions

### Issue: "new row violates row-level security policy"
**Solution**: The WITH CHECK clause is failing. Make sure the data being updated is allowed by RLS.

### Issue: "permission denied for table profiles"
**Solution**: RLS is not enabled OR no policies exist that allow the operation.

### Issue: "JWT token expired"
**Solution**: Call `supabase.auth.refreshSession()` before the update.

### Issue: "relation 'profiles' does not exist"
**Solution**: Check the schema. Table might be in a different schema or spelled wrong.

---

## Emergency Contact

If all else fails and saves still don't work:

1. Export current data from Supabase
2. Check for any recent migrations that might have changed RLS
3. Review the `handle_new_user` trigger - it might be blocking updates
4. Consider temporarily using the service role key (NEVER in production!)
