# Invite Friends Feature

## Overview

The Invite Friends feature allows authenticated users to invite others via email address using Supabase's built-in email invite system. Each invite gets a unique tracking ID that can be used in sign-up links to track referrals. Invites are sent as actual email invitations through Supabase Auth.

## Implementation Summary

### 1. UI Components

#### Header Component (`src/components/Header.tsx`)

- Added "Invite Friends" button to the left of the user name
- Button only shows for authenticated users (when `onSignOut` prop exists)
- Hidden on small screens (`hidden sm:flex`)
- Opens the InviteFriendsDialog when clicked

#### InviteFriendsDialog Component (`src/components/InviteFriendsDialog.tsx`)

- Allows users to enter multiple email addresses
- Email validation using regex pattern to ensure valid email format
- Supports various separators: newlines, commas, or semicolons
- Shows specific error messages for invalid email addresses
- Calls the `send-invites` Edge Function to process invitations
- Users receive actual invitation emails via Supabase Auth

### 2. Backend (Supabase Edge Function)

#### Edge Function: `send-invites` (`supabase/functions/send-invites/index.ts`)

- Authenticates the requesting user
- Creates invite records in the database with unique tracking IDs
- Sends invitation emails using Supabase Auth's `inviteUserByEmail` API
- Includes invite tracking parameters in the signup redirect URL
- Returns detailed results about successful and failed invitations

**Key Features:**

- ✅ Secure - Uses service role key only on the backend
- ✅ Tracks each invite with unique ID
- ✅ Sends actual email invitations through Supabase
- ✅ Includes inviter's name in the invitation metadata
- ✅ Handles partial failures gracefully

### 3. Database Schema

#### Invites Table

Run `database/create_invites_table.sql` in your Supabase SQL Editor.

**Schema:**

```sql
CREATE TABLE invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_id TEXT UNIQUE NOT NULL,           -- Unique tracking ID (10 chars)
  invited_by UUID NOT NULL,                  -- User who sent the invite
  email TEXT NOT NULL,                       -- Email address of invitee
  status TEXT DEFAULT 'pending',             -- 'pending', 'accepted', 'expired'
  accepted_by UUID,                          -- User who accepted the invite
  accepted_at TIMESTAMP WITH TIME ZONE,      -- When accepted
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Key Features:**

- ✅ Unique `invite_id` auto-generated for each invite (10-character alphanumeric)
- ✅ Email validation on the client side before submission
- ✅ **Actual invitation emails sent via Supabase Auth**
- ✅ Invite link includes tracking parameter for attribution
- ✅ Status tracking: pending, accepted, expired
- ✅ Records who accepted the invite and when
- ✅ RLS policies ensure users can only manage their own invites
- ✅ Automatic timestamp updates

**Helper Functions:**

- `generate_invite_id()` - Generates unique 10-character ID
- `set_invite_id()` - Trigger to auto-generate invite_id on insert
- `mark_invite_accepted(invite_id, user_id)` - Mark invite as accepted during sign-up

## Setup Instructions

### 1. Database Setup

Run the SQL migration in your Supabase SQL Editor:

```bash
# File: database/create_invites_table.sql
```

This creates the `invites` table, indexes, RLS policies, and helper functions.

### 2. Deploy Edge Function

Deploy the `send-invites` Edge Function to your Supabase project:

```bash
# Make sure you have Supabase CLI installed
supabase functions deploy send-invites

# Or deploy all functions
supabase functions deploy
```

### 3. Configure Email Templates (Optional)

In your Supabase Dashboard:

1. Go to **Authentication → Email Templates**
2. Customize the "Invite user" template to match your brand
3. The template will automatically include the invite tracking link

### 4. Environment Variables

Make sure your `.env` file includes:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

The Edge Function will automatically use the `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project.

## How It Works

### Invite Flow

1. **User sends invites**

   - Opens "Invite Friends" dialog from header
   - Enters email addresses (validated on client)
   - Clicks "Send Invites"

2. **Edge Function processes**

   - Creates invite record in database with unique `invite_id`
   - Sends invitation email via Supabase Auth Admin API
   - Includes tracking link: `https://yourapp.com?invite=abc1234567`

3. **Recipient receives email**

   - Gets invitation email from Supabase
   - Email includes sign-up link with invite tracking
   - Click link redirects to app with `?invite=` parameter

4. **Recipient signs up**
   - Completes sign-up process
   - App captures `invite` parameter from URL
   - Marks invite as accepted in database

### Using Invite IDs in Sign-up Links

The invite emails automatically include the tracking parameter. When a new user signs up, capture and mark the invite:

**On sign-up completion, mark the invite as accepted:**

```typescript
// After successful sign-up
const inviteId = new URLSearchParams(window.location.search).get("invite");
if (inviteId && newUser) {
  await supabase.rpc("mark_invite_accepted", {
    invite_id_param: inviteId,
    user_id_param: newUser.id,
  });
}
```

### Viewing Invite Statistics

Get stats for the current user:

```sql
SELECT
  COUNT(*) as total_sent,
  COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
FROM invites
WHERE invited_by = auth.uid();
```

### Cleaning Up Old Invites

Mark old pending invites as expired (run periodically):

```sql
UPDATE invites
SET status = 'expired'
WHERE status = 'pending' AND created_at < NOW() - INTERVAL '90 days';
```

## Future Enhancements

1. **Referral Rewards**: Track successful referrals and reward users
2. **Invite Analytics Dashboard**: Show users their invite statistics
3. **Social Sharing**: Add options to share invite links via social media
4. **Custom Invite Messages**: Allow users to personalize invite messages
5. **Invite Limits**: Set limits on invites per user/time period
6. **Email Template Customization**: Further customize the invitation email design

## Security Considerations

- ✅ RLS policies prevent users from viewing/modifying others' invites
- ✅ invite_id is unique and randomly generated (collision-resistant)
- ✅ Status tracking prevents duplicate acceptance
- ✅ Service role key only used in Edge Function (not exposed to client)
- ✅ Authenticated users only can send invites
- ⚠️ Consider rate limiting to prevent spam
- ⚠️ Monitor for abuse via Edge Function logs

## Testing

1. **Deploy the Edge Function**

   ```bash
   supabase functions deploy send-invites
   ```

2. **Log in as an authenticated user**

3. **Click "Invite Friends" button in header**

4. **Enter email addresses** (one per line or separated by commas)

5. **Try entering an invalid email address** to see validation in action

6. **Submit the form with valid email addresses**

7. **Check the recipient's inbox** for the invitation email from Supabase

8. **Click the invitation link** in the email

9. **Complete sign-up** and verify the `?invite=` parameter is in the URL

10. **Check Supabase table** to verify:
    - Invite record was created with unique `invite_id`
    - Invite status changed to "accepted" after sign-up
    - `accepted_by` field contains the new user's ID
