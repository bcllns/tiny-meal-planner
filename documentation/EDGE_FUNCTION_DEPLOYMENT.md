# Deploying the Invite Friends Edge Function

## Prerequisites

1. **Supabase CLI installed**

   ```bash
   npm install -g supabase
   ```

2. **Supabase project linked**
   ```bash
   # If not already linked
   supabase link --project-ref your-project-ref
   ```

## Deployment Steps

### 1. Deploy the Edge Function

```bash
# Deploy the send-invites function
supabase functions deploy send-invites

# Or deploy all functions
supabase functions deploy
```

### 2. Verify Deployment

In your Supabase Dashboard:

1. Go to **Edge Functions**
2. You should see `send-invites` listed
3. Check the logs to ensure it deployed successfully

### 3. Test the Function

You can test the function locally before deploying:

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve send-invites

# In another terminal, test with curl:
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-invites' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"emails":["test@example.com"]}'
```

## Environment Variables

The Edge Function automatically has access to:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Anonymous key for client operations
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations

These are automatically provided by Supabase when the function is deployed.

## Troubleshooting

### Function not found

- Make sure you've deployed the function: `supabase functions deploy send-invites`
- Check your Supabase Dashboard → Edge Functions

### "Unauthorized" error

- Ensure the user is authenticated before calling the function
- Check that the Authorization header is being sent with a valid session token

### Emails not sending

- Verify your Supabase project has email configured
- Check **Authentication → Providers** - Email should be enabled
- Review the Edge Function logs in Supabase Dashboard

### "Admin API error"

- The service role key must have admin permissions
- Check that `SUPABASE_SERVICE_ROLE_KEY` is available (it should be by default)

## Monitoring

Monitor your Edge Function:

1. Go to **Supabase Dashboard → Edge Functions**
2. Click on `send-invites`
3. View **Logs** and **Metrics**
4. Check for errors or performance issues

## Security Notes

- ✅ Service role key is only used in the Edge Function (server-side)
- ✅ Client code only has access to the anon key
- ✅ RLS policies protect the invites table
- ✅ Authentication is verified before processing invites

## Cost Considerations

Supabase Edge Functions are billed based on:

- **Invocations**: Number of times the function is called
- **Compute time**: Execution duration

Check your [Supabase pricing](https://supabase.com/pricing) for current rates and free tier limits.
