# Shopping List Supabase Migration

## Overview

The shopping list feature has been migrated from localStorage to Supabase for persistent storage across devices and browsers.

## Database Schema

### Table: `shopping_lists`

```sql
CREATE TABLE public.shopping_lists (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  consolidated_ingredients JSONB DEFAULT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**

- One shopping list per user (enforced by `user_id` as primary key)
- `recipe_data`: Array of ShoppingListItem objects (recipeId, recipeName, ingredients[], servings, addedAt)
- `consolidated_ingredients`: Cached OpenAI consolidation results (saved automatically)
- Row Level Security (RLS) policies for user data isolation
- Automatic `updated_at` timestamp trigger

## Migration Steps

### 1. Run the Database Migration

Execute the SQL migration file in your Supabase SQL Editor:

```bash
# File location:
database/create_shopping_lists_table.sql
```

Or run it via Supabase CLI:

```bash
supabase db push
```

### 2. Code Changes

#### Updated Files:

1. **src/lib/shoppingList.ts**

   - All functions now async (return Promises)
   - Uses Supabase queries instead of localStorage
   - Automatic consolidation cache management

2. **src/components/ShoppingListView.tsx**

   - Updated to handle async shopping list functions
   - Better error handling for database operations

3. **src/components/MyRecipesView.tsx**
   - Updated to handle async add/remove operations
   - Async loading of shopping list status

#### Function Signature Changes:

**Before (localStorage):**

```typescript
export function getShoppingList(userId: string | null = null): ShoppingListItem[];
export function addToShoppingList(recipe: SavedRecipe, userId: string | null = null): boolean;
export function removeFromShoppingList(recipeId: string, userId: string | null = null): boolean;
export function clearShoppingList(userId: string | null = null): boolean;
export function isInShoppingList(recipeId: string, userId: string | null = null): boolean;
```

**After (Supabase):**

```typescript
export async function getShoppingList(userId: string | null = null): Promise<ShoppingListItem[]>;
export async function addToShoppingList(recipe: SavedRecipe, userId: string | null = null): Promise<boolean>;
export async function removeFromShoppingList(recipeId: string, userId: string | null = null): Promise<boolean>;
export async function clearShoppingList(userId: string | null = null): Promise<boolean>;
export async function isInShoppingList(recipeId: string, userId: string | null = null): Promise<boolean>;
```

## Features

### 1. Persistent Storage

- Shopping lists saved to Supabase database
- Accessible across devices and browsers
- Survives browser data clearing

### 2. OpenAI Consolidation Caching

- Consolidated ingredients automatically saved to database
- Cache invalidated when recipes are added/removed
- Reduces unnecessary OpenAI API calls

### 3. Single List Per User

- Database enforces one shopping list per user
- Uses `upsert` pattern for atomic updates
- No duplicate lists possible

### 4. Data Isolation

- Row Level Security (RLS) ensures users only see their own data
- Automatic user_id filtering on all queries
- Data deleted on user account deletion (CASCADE)

## Testing

### Test the Migration:

1. Sign in to the app
2. Add recipes to shopping list
3. Navigate to Shopping List view
4. Verify OpenAI consolidation works
5. Refresh page - list should persist
6. Open in different browser/device - list should sync
7. Clear list and verify database deletion

### Verify Database:

```sql
-- Check shopping lists table
SELECT * FROM public.shopping_lists;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'shopping_lists';

-- Verify triggers
SELECT * FROM pg_trigger WHERE tgrelid = 'public.shopping_lists'::regclass;
```

## Rollback Plan (if needed)

If you need to rollback to localStorage:

1. **Revert code changes** in:

   - src/lib/shoppingList.ts
   - src/components/ShoppingListView.tsx
   - src/components/MyRecipesView.tsx

2. **Optional: Drop table**

```sql
DROP TABLE IF EXISTS public.shopping_lists CASCADE;
```

## Notes

- localStorage data is NOT automatically migrated - users will start with empty lists
- Consider adding a migration script if you want to preserve existing data
- The `clearCachedConsolidatedList()` function is now a no-op (kept for backward compatibility)
- All database operations include proper error handling and logging
