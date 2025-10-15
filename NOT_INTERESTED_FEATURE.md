# Not Interested Feature Implementation

## Overview

Added a "Not Interested" option to the MealCard menu that allows users to mark recipes they're not interested in. The data is stored in a new Supabase table with proper RLS policies.

## Changes Made

### 1. Database Schema

**File:** `database/create_not_interested_table.sql`

Created a new table with the following structure:

- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to auth.users
- `meal_id` (TEXT): The meal identifier
- `recipe_name` (TEXT): The name of the recipe
- `created_at` (TIMESTAMP): When the recipe was marked

**RLS Policies:**

- Users can only view their own not interested recipes
- Users can only add their own not interested recipes
- Users can only delete their own not interested recipes
- Unique constraint prevents duplicate entries (user + meal_id)

**Indexes:**

- `idx_not_interested_user_id`: For user queries
- `idx_not_interested_meal_id`: For meal queries
- `idx_not_interested_user_meal`: Composite index for lookups
- `idx_not_interested_user_meal_unique`: Unique constraint index

### 2. Helper Functions

**File:** `src/lib/notInterested.ts`

Created utility functions:

- `markAsNotInterested(mealId, recipeName)`: Mark a recipe as not interested
- `removeFromNotInterested(mealId)`: Remove not interested marking
- `checkIfNotInterested(mealId)`: Check if a recipe is marked
- `getNotInterestedRecipes()`: Get all not interested recipes for current user

All functions include:

- Authentication checks
- Error handling
- Duplicate entry handling
- TypeScript types

### 3. UI Component Updates

**Files:**

- `src/components/MealCard.tsx`
- `src/App.tsx`

**MealCard.tsx Updates:**

- Added `onNotInterested` callback prop to interface
- New state `isNotInterested` to track the status
- `handleNotInterested()` function to toggle the not interested status
- Calls `onNotInterested` callback when marking as not interested
- New menu option in the popover with ThumbsDown icon
- Loading state handling during API calls
- Dynamic text based on current state ("Not Interested" / "Remove Not Interested")

**App.tsx Updates:**

- Added `handleMealNotInterested()` function to remove meals from the displayed array
- Passed the handler to all `MealCard` components via the `onNotInterested` prop
- When a user marks a recipe as "Not Interested", the card is immediately removed from the dashboard

### 4. AI Meal Generation Integration

**File:** `src/lib/openai.ts`

**Updates:**

- Fetches user's not interested recipes before generating meal plan
- Fetches user's saved recipes before generating meal plan
- Automatically excludes both not interested AND saved recipes from OpenAI prompt
- Instructs AI to avoid suggesting similar dishes to those marked as not interested or already saved
- Seamlessly integrates user preferences into meal generation without requiring manual filtering

**How it works:**

1. When generating a meal plan, the function calls `getNotInterestedRecipes()` and `getSavedRecipes()`
2. Extracts recipe names from both the not interested and saved recipe lists
3. Combines them into a single exclusion list
4. Adds an exclusion instruction to the OpenAI prompt if any exist
5. OpenAI avoids suggesting those recipes or similar dishes

## Setup Instructions

1. **Run the SQL migration:**

   - Open your Supabase SQL Editor
   - Copy and paste the contents of `database/create_not_interested_table.sql`
   - Execute the SQL to create the table and policies

2. **Test the feature:**
   - Sign in to your app
   - Find any recipe card on the dashboard
   - Click the menu button (three dots)
   - Click "Not Interested"
   - The status should update and be persisted

## User Experience

- Click the menu icon on any recipe card
- Select "Not Interested" to mark a recipe
- **The card is immediately removed from the dashboard**
- The recipe is saved to the `not_interested` table in the database
- **Future meal plans will automatically exclude this recipe and similar dishes**
- **Saved recipes are also automatically excluded from future meal plans** - no duplicates!
- If you click "Remove Not Interested" from a saved recipe view, it can reappear in future meal plans
- Shows loading state during API calls
- Errors are displayed if the operation fails
- Status persists across sessions
- Smart AI integration ensures unwanted and already-saved recipes never appear again

## Security

- All operations require authentication (checked via `auth.uid()`)
- RLS policies ensure users can only manage their own preferences
- Unique constraint prevents duplicate entries
- Foreign key cascade deletes when user is deleted

## Future Enhancements

Potential improvements:

- ~~Filter out not interested recipes from meal plan generation~~ ✅ **IMPLEMENTED**
- Add a dedicated view to manage all not interested recipes
- Export/import not interested preferences
- Analytics on most commonly "not interested" recipes
- Allow users to provide reasons for disinterest to improve recommendations
