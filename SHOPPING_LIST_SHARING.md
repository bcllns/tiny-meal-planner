# Shopping List Sharing Feature

## Overview

Users can now share their consolidated shopping lists with anyone via a public link. Recipients can view the consolidated ingredients list without needing to log in.

## Database Schema

### Table: `shared_shopping_lists`

Run this migration in Supabase SQL Editor:

```bash
database/create_shared_shopping_lists_table.sql
```

**Schema:**

```sql
CREATE TABLE public.shared_shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consolidated_ingredients JSONB NOT NULL,
  total_servings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);
```

**Key Features:**

- Public read access (RLS policy allows anyone to view)
- Only authenticated users can create shares
- Users can only modify/delete their own shares
- Auto-cleanup function for expired shares
- Cascade delete when user is deleted

## Features Implemented

### 1. Share Button in Shopping List View

**Location:** `src/components/ShoppingListView.tsx`

- New "Share" button added to the left of the Print button
- Only enabled when consolidated list has items
- Shows loading spinner while generating share link
- Automatically opens share dialog when link is created

### 2. Share Dialog

**Component:** `src/components/ShareShoppingListDialog.tsx`

- Displays the share URL in a read-only input field
- Copy button with visual feedback (check mark on success)
- Clear messaging that only ingredients are shared (not recipes)
- Modal dialog that can be closed by clicking outside or X button

### 3. Shared Shopping List View

**Component:** `src/components/SharedShoppingListView.tsx`

Features:

- **Public Access:** No login required to view
- **Ingredients Only:** Shows consolidated ingredients, not individual recipes
- **Print Support:** Print button for easy printing
- **Error Handling:** Clear messages for not found/deleted lists
- **Call to Action:** Link to sign up at the bottom
- **Responsive Grid:** 1 column on mobile, 2 columns on desktop

### 4. Share Functions

**Location:** `src/lib/shoppingList.ts`

#### `shareShoppingList(consolidatedIngredients, userId)`

- Saves consolidated ingredients to `shared_shopping_lists` table
- Returns share ID (UUID) for URL generation
- Validates non-empty list
- Error handling with console logging

#### `getSharedShoppingList(shareId)`

- Public function (no auth required)
- Fetches consolidated ingredients by share ID
- Returns null if not found
- Used by SharedShoppingListView component

### 5. App Routing

**Location:** `src/App.tsx`

- Detects `?shoppingList={id}` query parameter
- Renders SharedShoppingListView before auth checks
- Cleans up URL after extracting share ID
- Shows minimal Header and Footer for public view

## User Flow

### Creating a Share

1. User navigates to Shopping List view
2. Clicks "Share" button (must have consolidated ingredients)
3. System creates share record in database
4. Share dialog appears with URL: `https://app.com?shoppingList={uuid}`
5. User clicks copy button to copy URL
6. User shares URL via email, messaging, etc.

### Viewing a Shared List

1. Recipient opens shared URL
2. App detects `?shoppingList={id}` parameter
3. SharedShoppingListView loads ingredients from database
4. Public view displays:
   - Consolidated ingredients (categorized and organized)
   - Print button
   - Call-to-action to sign up
5. No recipe details or sensitive information shown

## URL Format

**Share URL:**

```
https://your-domain.com?shoppingList=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Query Parameter:** `shoppingList` (UUID)

## Security Considerations

### What's Shared:

✅ Consolidated ingredients list (quantities, items, notes)
✅ Number of ingredients

### What's NOT Shared:

❌ Recipe names
❌ Individual recipe details
❌ Servings information
❌ User information
❌ Original recipe ingredients

### Privacy Features:

- Share links use random UUIDs (not sequential IDs)
- No user email or personal data exposed
- Recipients cannot see what recipes were used
- Users can delete shares at any time (future feature)

## Future Enhancements

### Optional Features:

1. **Expiration Dates:** Set expiration when creating share
2. **Delete Share:** Allow users to revoke/delete shares
3. **Share Management:** View list of all created shares
4. **Share Settings:** Choose what to include (categories, notes, etc.)
5. **Analytics:** Track views on shared lists
6. **Share History:** See who/when list was accessed

### Cleanup Function:

The migration includes a cleanup function that can be called manually or via cron:

```sql
SELECT cleanup_expired_shared_shopping_lists();
```

## Testing

### Test Creating a Share:

1. Sign in and add recipes to shopping list
2. Navigate to Shopping List view
3. Wait for consolidation to complete
4. Click "Share" button
5. Verify dialog appears with valid URL
6. Copy URL and open in incognito/different browser
7. Verify ingredients display correctly

### Test Public Access:

1. Open shared URL without being logged in
2. Verify ingredients display
3. Verify no recipe information shown
4. Test print functionality
5. Click "Get started free" link

### Test Error Handling:

1. Try invalid share ID: `?shoppingList=invalid`
2. Try deleted share (delete from database first)
3. Verify error messages display properly

### Verify Database:

```sql
-- Check shared lists
SELECT * FROM public.shared_shopping_lists;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'shared_shopping_lists';

-- Test public read access (as anonymous)
SELECT consolidated_ingredients FROM public.shared_shopping_lists WHERE id = 'your-share-id';
```

## Files Modified

### New Files:

1. `database/create_shared_shopping_lists_table.sql` - Database migration
2. `src/components/ShareShoppingListDialog.tsx` - Share dialog component
3. `src/components/SharedShoppingListView.tsx` - Public view component
4. `SHOPPING_LIST_SHARING.md` - This documentation

### Modified Files:

1. `src/lib/shoppingList.ts` - Added share functions
2. `src/components/ShoppingListView.tsx` - Added Share button and logic
3. `src/App.tsx` - Added routing for shared shopping lists

## Migration Steps

1. **Run Database Migration:**

   ```sql
   -- Copy and paste contents of:
   database/create_shared_shopping_lists_table.sql
   ```

2. **Test the Feature:**

   - Create a shopping list with recipes
   - Click Share button
   - Open share URL in incognito window
   - Verify ingredients display correctly

3. **Optional: Set up Cleanup Cron:**
   Configure Supabase Edge Function or external cron to call:
   ```sql
   SELECT cleanup_expired_shared_shopping_lists();
   ```

## Troubleshooting

### Share button disabled:

- Ensure shopping list has items
- Wait for OpenAI consolidation to complete
- Check that `consolidatedList` array has length > 0

### Share link not working:

- Verify database migration ran successfully
- Check RLS policies are enabled
- Confirm share ID exists in database
- Check browser console for errors

### Ingredients not displaying:

- Verify `consolidated_ingredients` JSONB is properly formatted
- Check that `getSharedShoppingList()` is returning data
- Inspect network tab for API errors
