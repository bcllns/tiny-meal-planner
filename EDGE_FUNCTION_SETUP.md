# Edge Function Setup Guide

This guide explains how to deploy the `generate-meal-plan` Edge Function to fix the CORS error when calling OpenAI API.

## Problem

Direct calls to OpenAI API from the browser are blocked by CORS (Cross-Origin Resource Sharing) security restrictions. The solution is to use a Supabase Edge Function as a secure proxy.

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

### 4. Deploy the Edge Function

```bash
supabase functions deploy generate-meal-plan
```

### 5. Verify the deployment

After deployment, you should see output like:

```
Deployed Function generate-meal-plan to https://[project-ref].supabase.co/functions/v1/generate-meal-plan
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

4. Serve the function locally:
   ```bash
   supabase functions serve generate-meal-plan --env-file supabase/functions/.env.local
   ```

## Testing

After deployment, test the meal planner form in your app. The error should be resolved, and meal plans should generate successfully.

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

The Edge Function uses these environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key (set via `supabase secrets set`)
- `SUPABASE_URL`: Automatically provided by Supabase
- `SUPABASE_ANON_KEY`: Automatically provided by Supabase

## Code Changes

The following files were modified:

- `src/lib/openai.ts`: Updated to call the Edge Function instead of OpenAI directly
- Created: `supabase/functions/generate-meal-plan/index.ts`: Edge Function that proxies OpenAI requests

## Benefits

1. **Security**: OpenAI API key is kept server-side, never exposed to the browser
2. **CORS**: No more CORS errors since requests go through your Supabase backend
3. **Tracking**: OpenAI results are automatically saved to the database for analytics
4. **Authentication**: Function verifies user is logged in before processing requests
