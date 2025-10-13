import { supabase } from './supabase'

export interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string
  trial_used: boolean
  subscription_status: string | null
  subscription_id: string | null
  stripe_customer_id: string | null
  subscription_end_date: string | null
  created_at: string
}

/**
 * Check if user can generate meals (either has active subscription or hasn't used trial)
 */
export async function canGenerateMeals(userId: string): Promise<{ canGenerate: boolean; reason?: string }> {
  if (!supabase) {
    return { canGenerate: false, reason: 'Database connection unavailable' }
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('trial_used, subscription_status, subscription_end_date')
    .eq('user_id', userId)
    .single()

  if (error || !profile) {
    return { canGenerate: false, reason: 'Unable to verify subscription status' }
  }

  // Check if user has active subscription
  if (profile.subscription_status === 'active') {
    // For annual subscriptions, also check if it hasn't expired
    if (profile.subscription_end_date) {
      const endDate = new Date(profile.subscription_end_date)
      if (endDate > new Date()) {
        return { canGenerate: true }
      } else {
        return { canGenerate: false, reason: 'Subscription has expired' }
      }
    }
    return { canGenerate: true }
  }

  // Check if user still has trial available
  if (!profile.trial_used) {
    return { canGenerate: true }
  }

  return { canGenerate: false, reason: 'Trial used - subscription required' }
}

/**
 * Mark the user's trial as used
 */
export async function markTrialAsUsed(userId: string): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('user_profiles')
    .update({ trial_used: true })
    .eq('user_id', userId)

  return !error
}

/**
 * Update user's subscription information after successful payment
 */
export async function updateSubscription(
  userId: string,
  subscriptionId: string,
  customerId: string,
  status: string,
  endDate?: Date
): Promise<boolean> {
  if (!supabase) return false

  const updateData: {
    subscription_id: string
    stripe_customer_id: string
    subscription_status: string
    subscription_end_date?: string
  } = {
    subscription_id: subscriptionId,
    stripe_customer_id: customerId,
    subscription_status: status,
  }

  if (endDate) {
    updateData.subscription_end_date = endDate.toISOString()
  }

  const { error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('user_id', userId)

  return !error
}

/**
 * Get user's profile including subscription info
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data as UserProfile
}
