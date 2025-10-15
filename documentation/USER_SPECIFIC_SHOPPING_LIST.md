# User-Specific Shopping List Implementation

## Overview

The shopping list has been updated to be user-specific, ensuring that each user only sees their own shopping list items. When a user logs out, their shopping list is cleared from localStorage, and when a new user logs in, they will not see the previous user's shopping list.

## Problem Solved

**Before:** The shopping list was stored in a shared localStorage key (`meal_planner_shopping_list`), which meant:

- All users on the same browser shared the same shopping list
- When User A logged out and User B logged in, User B could see User A's shopping list
- Privacy concern - users could see each other's data

**After:** Each user has their own isolated shopping list:

- Shopping lists are stored with user-specific keys (`meal_planner_shopping_list_<userId>`)
- Users can only access their own shopping lists
- Shopping lists are automatically cleared on logout
- Complete user data isolation

## Implementation Changes

### 1. Shopping List Library (`src/lib/shoppingList.ts`)

#### Added User-Specific Storage Keys

```typescript
const STORAGE_KEY_PREFIX = "meal_planner_shopping_list";
const CONSOLIDATED_CACHE_KEY_PREFIX = "meal_planner_consolidated_list";

function getStorageKey(userId: string | null): string {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

function getConsolidatedCacheKey(userId: string | null): string {
  return userId ? `${CONSOLIDATED_CACHE_KEY_PREFIX}_${userId}` : CONSOLIDATED_CACHE_KEY_PREFIX;
}
```

#### Updated All Functions to Accept userId

All shopping list functions now accept an optional `userId` parameter:

- `getShoppingList(userId: string | null = null)`
- `addToShoppingList(recipe: SavedRecipe, userId: string | null = null)`
- `removeFromShoppingList(recipeId: string, userId: string | null = null)`
- `clearShoppingList(userId: string | null = null)`
- `isInShoppingList(recipeId: string, userId: string | null = null)`
- `getCachedConsolidatedList(userId: string | null = null)`
- `setCachedConsolidatedList(recipeIds, consolidated, userId: string | null = null)`
- `hasShoppingListChanged(userId: string | null = null)`

### 2. ShoppingListView Component (`src/components/ShoppingListView.tsx`)

#### Added userId Prop

```typescript
interface ShoppingListViewProps {
  userId?: string | null;
}

export function ShoppingListView({ userId = null }: ShoppingListViewProps);
```

#### Updated All Function Calls

All shopping list function calls now pass the userId:

```typescript
const list = getShoppingList(userId);
const needsConsolidation = hasShoppingListChanged(userId);
const cache = getCachedConsolidatedList(userId);
setCachedConsolidatedList(recipeIds, consolidated, userId);
clearShoppingList(userId);
```

#### Added userId to useEffect Dependency

```typescript
useEffect(() => {
  loadShoppingList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [userId]);
```

This ensures the shopping list reloads when the user changes.

### 3. MyRecipesView Component (`src/components/MyRecipesView.tsx`)

#### Added userId Prop

```typescript
interface MyRecipesViewProps {
  userId?: string | null;
}

export function MyRecipesView({ userId = null }: MyRecipesViewProps);
```

#### Updated Shopping List Function Calls

```typescript
// Check if in shopping list
if (isInShoppingList(recipe.meal_id, userId))
  // Add to shopping list
  addToShoppingList(recipe, userId);

// Remove from shopping list
removeFromShoppingList(mealId, userId);
```

### 4. App Component (`src/App.tsx`)

#### Import clearShoppingList

```typescript
import { clearShoppingList } from "@/lib/shoppingList";
```

#### Clear Shopping List on Logout

```typescript
const handleSignOut = async () => {
  // Clear user-specific shopping list before signing out
  if (user?.id) {
    clearShoppingList(user.id);
  }

  await signOut();
  // ... rest of logout logic
};
```

#### Pass userId to Components

```typescript
{
  activeTab === "recipes" && <MyRecipesView userId={user?.id} />;
}

{
  activeTab === "shopping" && <ShoppingListView userId={user?.id} />;
}
```

## How It Works

### Storage Key Pattern

```
Without userId (backward compatible):
- meal_planner_shopping_list
- meal_planner_consolidated_list

With userId (user-specific):
- meal_planner_shopping_list_abc123
- meal_planner_consolidated_list_abc123
```

### User Flow

#### Login Scenario

```
User A logs in (userId: "user-a-123")
    ↓
Shopping list uses key: "meal_planner_shopping_list_user-a-123"
    ↓
User A adds recipes to shopping list
    ↓
Data saved to localStorage with user-specific key
    ↓
User A logs out
    ↓
Shopping list cleared: "meal_planner_shopping_list_user-a-123" removed
```

#### User Switch Scenario

```
User A logged in, has shopping list with 5 items
    ↓
User A logs out → Shopping list cleared
    ↓
User B logs in (userId: "user-b-456")
    ↓
Shopping list uses key: "meal_planner_shopping_list_user-b-456"
    ↓
User B sees EMPTY shopping list (correct!)
    ↓
User B's data completely isolated from User A
```

## Security & Privacy

### Data Isolation

✅ Each user has completely separate shopping list data
✅ Users cannot access other users' shopping lists
✅ Shopping lists are automatically cleared on logout
✅ No data leakage between user sessions

### localStorage Keys

✅ User-specific keys prevent cross-contamination
✅ Keys include user ID for complete isolation
✅ Backward compatible with null userId (for edge cases)

### Logout Behavior

✅ Explicitly clears user's shopping list
✅ Removes consolidated cache
✅ Clean slate for next user

## Backward Compatibility

The implementation maintains backward compatibility:

1. **userId is optional** - All functions have `userId: string | null = null`
2. **Null userId fallback** - Uses original key names when userId is null
3. **Existing data** - Old shopping lists without userId still work (though not isolated)

## Testing Scenarios

### Test Case 1: Single User

```
1. User logs in
2. Adds recipes to shopping list
3. Logs out
4. Logs back in
Expected: Shopping list is empty (cleared on logout)
```

### Test Case 2: Multiple Users

```
1. User A logs in
2. User A adds 3 recipes to shopping list
3. User A logs out
4. User B logs in
5. User B checks shopping list
Expected: User B sees empty shopping list (not User A's items)
```

### Test Case 3: User Data Isolation

```
1. User A logs in and adds recipes
2. User A logs out
3. User B logs in and adds different recipes
4. User B logs out
5. User A logs back in
Expected: User A sees empty shopping list (cleared on previous logout)
```

### Test Case 4: Consolidated Cache

```
1. User logs in
2. Adds recipes and consolidates shopping list
3. Consolidated cache saved with user-specific key
4. User logs out
5. Cache cleared along with shopping list
```

## Benefits

### For Users

✅ **Privacy** - Shopping lists are completely private
✅ **Security** - No data leakage between users
✅ **Clean Experience** - No confusion from seeing other users' items
✅ **Fresh Start** - Each login starts with clean state

### For Developers

✅ **User Isolation** - Proper data separation
✅ **Maintainable** - Clear, predictable behavior
✅ **Scalable** - Works with any number of users
✅ **Debuggable** - Easy to identify user-specific issues

### For Privacy

✅ **No Cross-User Data** - Complete isolation
✅ **Automatic Cleanup** - Data removed on logout
✅ **Compliant** - Better privacy practices
✅ **Transparent** - Clear data ownership

## localStorage Structure

### Before (Shared)

```
localStorage:
  meal_planner_shopping_list: [recipe1, recipe2, recipe3]
  meal_planner_consolidated_list: {...}
```

### After (User-Specific)

```
localStorage:
  meal_planner_shopping_list_user-a-123: [recipeA1, recipeA2]
  meal_planner_consolidated_list_user-a-123: {...}
  meal_planner_shopping_list_user-b-456: [recipeB1, recipeB2, recipeB3]
  meal_planner_consolidated_list_user-b-456: {...}
```

On logout:

```
User A logs out:
  ✅ meal_planner_shopping_list_user-a-123 → REMOVED
  ✅ meal_planner_consolidated_list_user-a-123 → REMOVED

User B's data remains:
  ✓ meal_planner_shopping_list_user-b-456: [recipeB1, recipeB2, recipeB3]
  ✓ meal_planner_consolidated_list_user-b-456: {...}
```

## Edge Cases Handled

### No User ID

- Functions fall back to original key names
- Backward compatible behavior
- Works for anonymous/unauthenticated scenarios

### User Switches Without Logout

- Each user still gets their own data
- Keys are different by design
- No cross-contamination possible

### Browser Shared by Multiple Users

- Each user has completely separate shopping lists
- No privacy concerns
- Proper data isolation

## Future Enhancements

Potential improvements:

- **Persistent Storage**: Save shopping lists to Supabase for cross-device access
- **Offline Sync**: Sync localStorage with database when online
- **Shopping List History**: Track past shopping lists per user
- **Share Feature**: Allow users to share specific shopping lists
- **Export**: Download shopping list as PDF with user attribution

## Migration Notes

No migration required! The changes are:

- Backward compatible
- Non-breaking
- Automatically applied on next user interaction

Existing shopping lists without userId will continue to work but won't be user-isolated until the user logs in/out again.

## Summary

The shopping list is now **completely user-specific and secure**:

✅ Each user has their own isolated shopping list
✅ Shopping lists are cleared on logout  
✅ No data leakage between users
✅ Proper privacy and security implemented
✅ Clean user experience
✅ Backward compatible

Users can now confidently use the shopping list feature knowing their data is private and will not be visible to other users! 🔒
