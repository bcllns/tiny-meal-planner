# Edge Function Setup Guide

This guide explains how to deploy the Edge Functions to fix CORS errors when calling OpenAI API.

## Problem

Direct calls to OpenAI API from the browser are blocked by CORS (Cross-Origin Resource Sharing) security restrictions. The solution is to use Supabase Edge Functions as secure server-side proxies.

## Prerequisites

1. Supabase CLI installed (`npm install -g supabase`)
2. Supabase account and project
3. OpenAI API key

## Setup Steps

### 1. Login to Supabase CLI

```bash
supabase login
```

### 2. Link your project

```bash
supabase link --project-ref your-project-ref
```

You can find your project ref in your Supabase dashboard URL:
`https://app.supabase.com/project/[your-project-ref]`

### 3. Set the OpenAI API Key as a secret

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 4. Deploy the Edge Functions

```bash
supabase functions deploy generate-meal-plan
supabase functions deploy consolidate-ingredients
```

Or use the automated script:

```bash
./deploy-edge-function.sh
```

### 5. Verify the deployment

After deployment, you should see output like:

```
Deployed Function generate-meal-plan to https://[project-ref].supabase.co/functions/v1/generate-meal-plan
Deployed Function consolidate-ingredients to https://[project-ref].supabase.co/functions/v1/consolidate-ingredients
```

## Local Development (Optional)

To test the Edge Function locally:

1. Create a `.env.local` file in `supabase/functions/`:

   ```bash
   cp supabase/functions/.env.example supabase/functions/.env.local
   ```

2. Add your OpenAI API key to `.env.local`

3. Start Supabase locally:

   ```bash
   supabase start
   ```

4. Serve the functions locally:

   ```bash
   # Serve meal plan function
   supabase functions serve generate-meal-plan --env-file supabase/functions/.env.local

   # Or serve consolidate ingredients function
   supabase functions serve consolidate-ingredients --env-file supabase/functions/.env.local
   ```

## Testing

After deployment, test both features in your app:

1. **Meal Planner**: Generate a meal plan - should work without CORS errors
2. **Shopping List**: Add recipes and consolidate - should work without CORS errors

## Troubleshooting

### Function returns 401 Unauthorized

- Make sure you're logged in when testing
- Check that the auth token is being sent correctly

### Function returns 400 with OpenAI API error

- Verify your OpenAI API key is set correctly: `supabase secrets list`
- Check if you have credits in your OpenAI account

### Function not found

- Verify deployment was successful
- Check the function URL in your Supabase dashboard under Edge Functions

## Environment Variables

The Edge Functions use these environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key (set via `supabase secrets set`)
- `SUPABASE_URL`: Automatically provided by Supabase
- `SUPABASE_ANON_KEY`: Automatically provided by Supabase

## Code Changes

The following files were modified:

- `src/lib/openai.ts`: Updated to call the `generate-meal-plan` Edge Function
- `src/lib/consolidateIngredients.ts`: Updated to call the `consolidate-ingredients` Edge Function
- Created: `supabase/functions/generate-meal-plan/index.ts`: Edge Function for meal plan generation
- Created: `supabase/functions/consolidate-ingredients/index.ts`: Edge Function for shopping list consolidation

## Benefits

1. **Security**: OpenAI API key is kept server-side, never exposed to the browser
2. **CORS**: No more CORS errors since requests go through your Supabase backend
3. **Tracking**: OpenAI results are automatically saved to the database for analytics
4. **Authentication**: Function verifies user is logged in before processing requests
