# Tutorial Dialog Implementation

## Overview

Implemented a welcome tutorial dialog that appears when users first land on the dashboard. The dialog explains how Tiny Meal Planner works and informs users they can use the Meal Planner twice for free before a subscription is required.

## Changes Made

### 1. Database Migration

**File:** `database/add_tutorial_shown_column.sql`

Added a new column to the `user_profiles` table:

- `tutorial_shown` (BOOLEAN, DEFAULT FALSE) - Tracks whether the user has seen the tutorial dialog
- Added an index for faster lookups
- Includes documentation comment

**To Apply:** Run this SQL in your Supabase SQL Editor.

### 2. TypeScript Type Update

**File:** `src/types/user.ts`

Updated the `UserProfile` interface to include:

```typescript
tutorial_shown?: boolean
```

### 3. Auth Library Update

**File:** `src/lib/auth.ts`

Added a new function:

```typescript
markTutorialAsShown(): Promise<{ error: string | null }>
```

This function updates the user's profile to mark the tutorial as shown after they close the dialog.

### 4. Tutorial Dialog Component

**File:** `src/components/TutorialDialog.tsx` (NEW)

Created a new dialog component that displays:

- Welcome message with Tiny Meal Planner branding
- 4-step guide explaining how the app works:
  1. Share Your Preferences
  2. Get AI-Powered Suggestions
  3. Save Your Favorites
  4. Create Shopping Lists
- Highlighted information about the free trial (2 free meal plans)
- "Get Started" button to close the dialog

Design features:

- Uses consistent UI components (Dialog, Button)
- Icons for each step (Sparkles, ChefHat, BookmarkCheck, ShoppingCart)
- Responsive layout (sm:max-w-2xl)
- Styled trial information callout with primary color accent

### 5. App Integration

**File:** `src/App.tsx`

Changes made:

- Imported `TutorialDialog` component and `markTutorialAsShown` function
- Added `showTutorialDialog` state
- Added logic to check if `tutorial_shown` is false when user profile is loaded
- If not shown, automatically displays the tutorial dialog
- Added `handleTutorialClose` function that:
  - Closes the dialog
  - Calls `markTutorialAsShown()` to update the database
  - Updates the local profile state
- Rendered `TutorialDialog` component in the dashboard view

## User Experience Flow

1. **New User Signs Up/Signs In**

   - User authenticates successfully
   - App fetches user profile from database
   - Checks `tutorial_shown` field

2. **First Dashboard Visit**

   - If `tutorial_shown === false`, dialog appears automatically
   - User reads the tutorial information
   - Clicks "Get Started" button

3. **Dialog Closes**

   - `markTutorialAsShown()` updates database
   - Local state updated to prevent showing again
   - User proceeds to use the dashboard

4. **Subsequent Visits**
   - `tutorial_shown === true` in database
   - Dialog does not appear
   - User goes directly to dashboard

## Testing Checklist

- [ ] Run the database migration in Supabase
- [ ] Sign up as a new user
- [ ] Verify tutorial dialog appears on first dashboard load
- [ ] Click "Get Started" button
- [ ] Verify dialog closes
- [ ] Refresh the page
- [ ] Verify dialog does NOT appear again
- [ ] Check Supabase `user_profiles` table to confirm `tutorial_shown = true`

## Notes

- The tutorial only shows once per user
- The dialog is modal and requires user interaction to close
- The free trial information (2 meal plans) is prominently displayed
- The tutorial complements existing How It Works page but provides in-app guidance
- Database update happens asynchronously after dialog closes
