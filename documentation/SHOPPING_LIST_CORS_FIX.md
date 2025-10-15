# Shopping List CORS Fix - Summary

## Problem

The shopping list consolidation feature was using the OpenAI SDK with `dangerouslyAllowBrowser: true`, which could still encounter CORS errors and exposed the API key in the browser.

## Solution

Created a second Supabase Edge Function (`consolidate-ingredients`) to handle shopping list consolidation server-side, matching the same pattern used for meal plan generation.

## Changes Made

### 1. Created New Edge Function

**File**: `supabase/functions/consolidate-ingredients/index.ts`

- Handles ingredient consolidation requests server-side
- Authenticates users before processing
- Calls OpenAI API to intelligently combine and organize ingredients
- Returns consolidated shopping list to the frontend

### 2. Updated Frontend Code

**File**: `src/lib/consolidateIngredients.ts`

- Removed OpenAI SDK import
- Now calls the Supabase Edge Function instead
- Simplified code and improved security

### 3. Updated Deployment Script

**File**: `deploy-edge-function.sh`

- Now deploys both Edge Functions:
  - `generate-meal-plan`
  - `consolidate-ingredients`

## Deployment

The deployment script now handles both Edge Functions automatically:

```bash
./deploy-edge-function.sh
```

Or deploy manually:

```bash
# Deploy both functions
supabase functions deploy generate-meal-plan
supabase functions deploy consolidate-ingredients
```

## Benefits

✅ **No CORS errors** - All OpenAI calls go through secure backend  
✅ **Better security** - API key never exposed to browser  
✅ **Authentication required** - Only logged-in users can consolidate ingredients  
✅ **Consistent pattern** - Both meal planning and shopping list use the same architecture  
✅ **Production ready** - No more `dangerouslyAllowBrowser` flag

## Optional: Clean Up Dependencies

Since the OpenAI SDK is no longer needed in the frontend, you can optionally remove it:

```bash
npm uninstall openai
```

This will reduce your bundle size.

## Testing

After deployment:

1. Add recipes to your shopping list
2. Click "Consolidate Shopping List"
3. The ingredients should consolidate without any CORS errors
4. The consolidated list should intelligently combine quantities

## All Edge Functions

Your app now has two Edge Functions:

1. **`generate-meal-plan`** - Generates meal plans with recipes
2. **`consolidate-ingredients`** - Consolidates shopping list ingredients

Both use the same OpenAI API key secret and follow the same security patterns.
