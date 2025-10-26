# Diagnosing the Invite 400 Error

## Most Common Causes

The 400 error when submitting the invite form is usually caused by one of these issues:

### 1. Database Table Not Created

**Check if the table exists:**

In your Supabase SQL Editor, run:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'invites'
);
```

If it returns `false`, you need to create the table.

**Fix: Create the table**

⚠️ **Important:** First fix the syntax error in `database/create_invites_table.sql`:

Change line 4 from:

```sql
CREATE OR UPDATE TABLE invites (
```

To:

```sql
CREATE TABLE IF NOT EXISTS invites (
```

Then run the entire SQL file in your Supabase SQL Editor.

### 2. Check What Error is Being Returned

Open your browser's Developer Console (F12) and look for the detailed error. You should see something like:

```
Edge Function error: {error: "...", details: "..."}
```

The error message will tell you exactly what's wrong.

### 3. Check Supabase Dashboard Logs

1. Go to your Supabase Dashboard
2. Click on **Edge Functions** in the left menu
3. Click on **send-invites**
4. Click on the **Logs** tab
5. Look for recent errors with detailed messages

Common errors you'll see:

#### "Failed to create invite record for {email}: relation 'invites' does not exist"

- **Cause:** Database table not created
- **Fix:** Run the SQL migration (after fixing the syntax error)

#### "Failed to create invite record for {email}: new row violates row-level security policy"

- **Cause:** RLS policies are too restrictive
- **Fix:** The SQL file should handle this, but you may need to check the policies

#### "Failed to send invite to {email}: User already registered"

- **Cause:** The email address is already registered in your Supabase project
- **Fix:** Use a different email address for testing, or this is expected behavior

## Step-by-Step Fix

### Step 1: Fix the SQL File

Edit `database/create_invites_table.sql`:

```sql
-- Line 4: Change this
CREATE OR UPDATE TABLE invites (

-- To this:
CREATE TABLE IF NOT EXISTS invites (
```

### Step 2: Run the Migration

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left menu
3. Click **New Query**
4. Copy and paste the entire contents of `database/create_invites_table.sql`
5. Click **Run** or press `Ctrl+Enter` / `Cmd+Enter`
6. Check for any errors in the output

### Step 3: Verify Table Creation

Run this query to verify:

```sql
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'invites'
ORDER BY ordinal_position;
```

You should see all the columns: id, invite_id, invited_by, email, status, etc.

### Step 4: Verify RLS Policies

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'invites';
```

You should see 4 policies (SELECT, INSERT, UPDATE, DELETE).

### Step 5: Test Again

1. Refresh your app
2. Log in
3. Click "Invite Friends"
4. Enter an email address
5. Submit

### Step 6: Check the Logs Again

If it still fails, check:

1. Browser console for the exact error message
2. Supabase Dashboard → Edge Functions → send-invites → Logs

## Quick Test Without UI

You can test the Edge Function directly using curl:

```bash
# Get your access token from localStorage
# In browser console, run:
# localStorage.getItem('sb-YOUR_PROJECT_REF-auth-token')
# Copy the access_token value

curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-invites' \
  --header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"emails":["test@example.com"]}'
```

This will show you the exact error response.

## Still Not Working?

If you've done all the above and it's still not working, check:

1. **Service Role Key**: The Edge Function needs the service role key to send invites. This should be automatically available in deployed functions.

2. **Email Provider**: Make sure email is enabled in Supabase:

   - Dashboard → Authentication → Providers
   - "Email" should be enabled

3. **Project Status**: Make sure your Supabase project is active and not paused

4. **Rate Limits**: Check if you've hit any rate limits (unlikely but possible)

## Contact Information

If all else fails, the detailed logs from the Edge Function should tell you exactly what's wrong. Share those logs for more specific help.
