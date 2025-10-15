#!/bin/bash

# Edge Function Deployment Script
# This script deploys the Edge Functions to Supabase

set -e

echo "🚀 Deploying Edge Functions to Supabase..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase."
    echo "Run: supabase login"
    exit 1
fi

echo "✅ Logged in to Supabase"

# Prompt for OpenAI API key if not already set
echo ""
echo "Setting OpenAI API key..."
echo "Enter your OpenAI API key (or press Enter to skip if already set):"
read -s OPENAI_KEY

if [ -n "$OPENAI_KEY" ]; then
    supabase secrets set OPENAI_API_KEY="$OPENAI_KEY"
    echo "✅ OpenAI API key set"
else
    echo "⏭️  Skipping OpenAI API key setup"
fi

# Deploy the function
echo ""
echo "Deploying Edge Functions..."
echo ""

echo "📦 Deploying generate-meal-plan..."
supabase functions deploy generate-meal-plan

echo ""
echo "📦 Deploying consolidate-ingredients..."
supabase functions deploy consolidate-ingredients

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Test the meal planner form in your app"
echo "2. Check the Supabase dashboard > Edge Functions for logs"
echo "3. If you encounter issues, check EDGE_FUNCTION_SETUP.md"
