# CORS Error Fix - Summary

## Problem

The meal planner form was failing with a CORS error:

```
Fetch API cannot load https://api.openai.com/v1/chat/completions due to access control checks.
```

This occurred because the app was attempting to call the OpenAI API directly from the browser, which is blocked by CORS security policies.

## Solution

Created a Supabase Edge Function to act as a secure server-side proxy for OpenAI API calls.

## Changes Made

### 1. Created Edge Function

**File**: `supabase/functions/generate-meal-plan/index.ts`

- Handles OpenAI API requests server-side
- Authenticates users before processing
- Saves generated meals to the database automatically
- Returns meal data to the frontend

### 2. Updated Frontend Code

**File**: `src/lib/openai.ts`

- Removed direct OpenAI API calls
- Now calls the Supabase Edge Function instead
- Simplified code (removed client-side API key handling)

### 3. Created Configuration Files

- `supabase/config.toml` - Supabase project configuration
- `supabase/functions/.env.example` - Environment variable template
- `supabase/functions/generate-meal-plan/deno.json` - Deno configuration

### 4. Created Documentation

- `EDGE_FUNCTION_SETUP.md` - Detailed setup and deployment guide
- `deploy-edge-function.sh` - Automated deployment script

## Deployment Steps

### Quick Start (Recommended)

Run the deployment script:

```bash
./deploy-edge-function.sh
```

### Manual Deployment

If you prefer to deploy manually:

1. **Install Supabase CLI** (if not already installed):

   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:

   ```bash
   supabase login
   ```

3. **Link your project**:

   ```bash
   supabase link --project-ref aqbuiempcobicwoynujt
   ```

4. **Set your OpenAI API key**:

   ```bash
   supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
   ```

   Use the same key from your `.env` file: `sk-proj-kCE3RPMiRTbM9KG8sRas...`

5. **Deploy the Edge Function**:
   ```bash
   supabase functions deploy generate-meal-plan
   ```

## Testing

After deployment:

1. Open your meal planner app
2. Fill out the meal planning form
3. Submit the form
4. The CORS error should be gone, and meals should generate successfully

## Benefits

✅ **Security**: OpenAI API key is server-side only (never exposed to browser)  
✅ **No CORS errors**: Requests go through your Supabase backend  
✅ **Authentication**: Only logged-in users can generate meal plans  
✅ **Automatic tracking**: Generated meals are saved to the database  
✅ **Better error handling**: Server-side validation and error messages

## Troubleshooting

### "Function not found" error

- Ensure deployment completed successfully
- Check Edge Functions in your Supabase dashboard

### "Unauthorized" error

- Make sure you're logged in to the app
- Check that your session is valid

### "OpenAI API error"

- Verify your OpenAI API key: `supabase secrets list`
- Check your OpenAI account has credits available

### Still seeing CORS error

- Clear your browser cache
- Make sure the app is using the updated code (restart dev server)
- Check browser console for the actual request URL

## Environment Variables

### Frontend (.env)

Keep your existing variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_KEY`
- `VITE_OPENAI_API_KEY` can remain but is no longer used

### Edge Function (Supabase Secrets)

- `OPENAI_API_KEY` - Set via `supabase secrets set`
- `SUPABASE_URL` - Automatically provided
- `SUPABASE_ANON_KEY` - Automatically provided

## Next Steps

1. Deploy the Edge Function using one of the methods above
2. Test the meal planner form
3. Monitor the Edge Function logs in your Supabase dashboard
4. (Optional) Remove `VITE_OPENAI_API_KEY` from `.env` after confirming everything works

## Questions?

See `EDGE_FUNCTION_SETUP.md` for detailed documentation.
