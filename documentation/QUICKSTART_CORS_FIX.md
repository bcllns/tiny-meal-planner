# 🚀 Quick Start: Fix CORS Errors

## TL;DR

Run this script to fix all CORS errors:

```bash
./deploy-edge-function.sh
```

## What This Does

- Deploys 2 Edge Functions to Supabase
- Fixes meal planner CORS errors
- Fixes shopping list CORS errors
- Keeps your OpenAI API key secure

## Before Running

Make sure you have:

1. ✅ Supabase CLI installed: `npm install -g supabase`
2. ✅ Logged into Supabase: `supabase login`
3. ✅ Your OpenAI API key ready

## The Command

```bash
./deploy-edge-function.sh
```

When prompted, enter your OpenAI API key (or press Enter if already set).

## What Gets Deployed

1. **generate-meal-plan** - Handles meal plan generation
2. **consolidate-ingredients** - Handles shopping list consolidation

## Testing

After deployment:

1. Try generating a meal plan → Should work! ✅
2. Try consolidating your shopping list → Should work! ✅

## If Something Goes Wrong

See the detailed guides:

- `COMPLETE_CORS_FIX.md` - Full overview
- `EDGE_FUNCTION_SETUP.md` - Detailed setup
- `CORS_FIX_SUMMARY.md` - Quick troubleshooting

## Support

Check Edge Function logs in your Supabase Dashboard if you encounter issues.
