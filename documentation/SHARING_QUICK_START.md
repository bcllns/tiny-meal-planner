# Quick Start: Recipe Sharing Feature

## Step 1: Run Database Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `database/create_shared_recipes_table.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute

This creates:

- `shared_recipes` table
- RLS policies for public sharing
- Helper functions for share ID generation
- View count tracking

## Step 2: Test the Feature

### Share a Recipe

1. Sign in to your app
2. Generate a meal plan OR go to My Recipes
3. Click the menu (three dots) on any recipe card
4. Click **Share**
5. Dialog opens with shareable URL like: `https://yourapp.com?share=ABC12345`
6. Click **Copy** button
7. Share the link with anyone!

### View a Shared Recipe (As Non-Logged-In User)

1. Open the share URL in incognito/private browser window (to simulate non-logged-in user)
2. Recipe displays in full-screen overlay
3. Shows "Shared by [name]" attribution
4. Click **Close** to go back

## Verification

Check if everything works:

```sql
-- Run in Supabase SQL Editor to verify table exists
SELECT * FROM shared_recipes LIMIT 5;

-- Check RLS policies are active
SELECT * FROM pg_policies WHERE tablename = 'shared_recipes';

-- Test share ID generation
SELECT generate_share_id();
```

## Troubleshooting

### "Table shared_recipes does not exist"

**Solution:** Run the migration SQL from `database/create_shared_recipes_table.sql`

### "Failed to share recipe"

**Possible causes:**

- User not authenticated → Check sign-in
- Database connection issue → Check Supabase connection
- RLS policy blocking → Verify migration ran successfully

### Share dialog shows "Failed to generate share link"

**Check:**

1. Browser console for errors
2. Supabase logs for RPC call failures
3. Network tab for failed API requests

## Features Available

✅ Share from dashboard meal cards
✅ Share from My Recipes view
✅ Copy link to clipboard
✅ Public access (no login required to view)
✅ View count tracking
✅ User attribution ("Shared by...")

## URL Format

Share links use query parameters: `?share=ABC12345`

- 8 characters (letters and numbers)
- Collision-free (DB ensures uniqueness)
- Works with single-page app architecture
