# Troubleshooting Invite Feature 400 Error

## Quick Checks

If you're getting a 400 (Bad Request) error when sending invites, follow these steps:

### 1. Check if Edge Function is Deployed

```bash
# List all deployed functions
supabase functions list

# You should see "send-invites" in the list
```

If not deployed:

```bash
supabase functions deploy send-invites
```

### 2. Check Supabase Configuration

Make sure your `.env` file has the correct values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Check Browser Console

Open your browser's developer console (F12) and look for:

- The error message being logged
- The full error response from the server

### 4. Check Edge Function Logs

In Supabase Dashboard:

1. Go to **Edge Functions**
2. Click on **send-invites**
3. Click on **Logs** tab
4. Look for recent errors

Common errors you might see:

#### "No authorization header"

- The user is not authenticated
- Session token is missing or expired
- **Fix**: Make sure user is logged in before opening invite dialog

#### "Supabase configuration missing"

- Environment variables not set in Edge Function
- **Fix**: Redeploy the function (environment vars are auto-provided by Supabase)

#### "Service role key not configured"

- Service role key is missing
- **Fix**: This should be automatic. Check Supabase project settings

#### "Failed to create invite record"

- Database table doesn't exist or RLS policy blocking
- **Fix**: Run the `create_invites_table.sql` migration

#### "Failed to send invite email"

- Email provider not configured
- User already exists
- **Fix**: Check Authentication settings in Supabase Dashboard

### 5. Test with Simple Request

Test the Edge Function directly with curl:

```bash
# Get your access token from browser localStorage
# In browser console, run:
# JSON.parse(localStorage.getItem('sb-<project-ref>-auth-token')).access_token

curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/send-invites' \
  --header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"emails":["test@example.com"]}'
```

### 6. Check Database Table

Make sure the `invites` table exists:

```sql
-- Run in Supabase SQL Editor
SELECT * FROM invites LIMIT 1;
```

If you get "relation does not exist":

```bash
# Run the migration
# File: database/create_invites_table.sql
```

### 7. Check RLS Policies

```sql
-- Check if RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'invites';
```

Should show policies for INSERT, SELECT, UPDATE, DELETE.

### 8. Check Email Provider

In Supabase Dashboard:

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Check **Email Templates** → "Invite user" template exists

## Common Solutions

### Solution 1: Redeploy Edge Function

```bash
supabase functions deploy send-invites
```

### Solution 2: Run Database Migration

```bash
# In Supabase SQL Editor, run:
# database/create_invites_table.sql
```

### Solution 3: Check Authentication

```javascript
// In browser console
const {
  data: { session },
} = await supabase.auth.getSession();
console.log("Session:", session);
// Should show valid session with access_token
```

### Solution 4: Test Locally

```bash
# Start Supabase locally
supabase start

# Serve function locally
supabase functions serve send-invites --env-file ./supabase/.env.local

# Test in another terminal
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-invites' \
  --header 'Authorization: Bearer YOUR_LOCAL_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"emails":["test@example.com"]}'
```

## Getting More Information

### Enable Detailed Logging

The Edge Function now includes detailed logging. Check the logs in:

- **Supabase Dashboard** → Edge Functions → send-invites → Logs

You'll see logs like:

- "Authorization header present: true"
- "User authenticated: true"
- "Received emails: 1"
- "Processing invite for: test@example.com"
- "Created invite record with ID: abc123"
- "Successfully sent invite to test@example.com"

### Check Client-Side Logs

In browser console, you'll see:

- "Edge Function error:" (if there's an error)
- The full error response

## Still Having Issues?

1. **Check Supabase Status**: https://status.supabase.com/
2. **Check Project Limits**: Make sure you haven't exceeded free tier limits
3. **Check Billing**: Some features require a paid plan
4. **Contact Support**: If all else fails, reach out to Supabase support with:
   - Edge Function logs
   - Browser console errors
   - Steps to reproduce

## Verification Checklist

- [ ] Edge Function deployed (`supabase functions deploy send-invites`)
- [ ] Database table created (run `create_invites_table.sql`)
- [ ] User is authenticated (check session in browser)
- [ ] Email provider enabled (Supabase Dashboard → Authentication)
- [ ] Environment variables configured (`.env` file)
- [ ] RLS policies exist on invites table
- [ ] Browser console shows no CORS errors
- [ ] Edge Function logs show request received
