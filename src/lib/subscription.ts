import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  trial_used: boolean;
  trial_start_date: string;
  meal_plans_generated: number;
  subscription_status: string | null;
  subscription_id: string | null;
  stripe_customer_id: string | null;
  subscription_end_date: string | null;
  created_at: string;
}

const TRIAL_DURATION_DAYS = 7;

/**
 * Check if user is within their 7-day trial period
 */
function isWithinTrialPeriod(trialStartDate: string): boolean {
  const startDate = new Date(trialStartDate);
  const now = new Date();
  const daysSinceStart = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceStart < TRIAL_DURATION_DAYS;
}

/**
 * Get days remaining in trial period
 */
export function getDaysRemainingInTrial(trialStartDate: string): number {
  const startDate = new Date(trialStartDate);
  const now = new Date();
  const daysSinceStart = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysRemaining = Math.max(0, Math.ceil(TRIAL_DURATION_DAYS - daysSinceStart));
  return daysRemaining;
}

/**
 * Check if user can generate meals (either has active subscription or within 7-day trial)
 */
export async function canGenerateMeals(userId: string): Promise<{ canGenerate: boolean; reason?: string; daysRemaining?: number }> {
  if (!supabase) {
    return { canGenerate: false, reason: "Database connection unavailable" };
  }

  const { data: profile, error } = await supabase.from("user_profiles").select("trial_start_date, subscription_status, subscription_end_date").eq("user_id", userId).single();

  if (error || !profile) {
    return { canGenerate: false, reason: "Unable to verify subscription status" };
  }

  // Check if user has active subscription
  if (profile.subscription_status === "active") {
    // For annual subscriptions, also check if it hasn't expired
    if (profile.subscription_end_date) {
      const endDate = new Date(profile.subscription_end_date);
      if (endDate > new Date()) {
        return { canGenerate: true };
      } else {
        return { canGenerate: false, reason: "Subscription has expired" };
      }
    }
    return { canGenerate: true };
  }

  // Check if user is within 7-day trial period
  if (profile.trial_start_date && isWithinTrialPeriod(profile.trial_start_date)) {
    const daysRemaining = getDaysRemainingInTrial(profile.trial_start_date);
    return {
      canGenerate: true,
      daysRemaining,
    };
  }

  return { canGenerate: false, reason: "Your 7-day free trial has ended - subscription required" };
}

/**
 * Increment the meal plans generated count (for analytics purposes)
 */
export async function incrementMealPlanCount(userId: string): Promise<{ success: boolean; newCount?: number }> {
  if (!supabase) return { success: false };

  // First get the current count
  const { data: profile, error: fetchError } = await supabase.from("user_profiles").select("meal_plans_generated").eq("user_id", userId).single();

  if (fetchError || !profile) {
    return { success: false };
  }

  const currentCount = profile.meal_plans_generated || 0;
  const newCount = currentCount + 1;

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      meal_plans_generated: newCount,
    })
    .eq("user_id", userId);

  if (updateError) {
    return { success: false };
  }

  return { success: true, newCount };
}

/**
 * Mark the user's trial as used (legacy function - kept for compatibility)
 */
export async function markTrialAsUsed(userId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from("user_profiles").update({ trial_used: true }).eq("user_id", userId);

  return !error;
}

/**
 * Update user's subscription information after successful payment
 */
export async function updateSubscription(userId: string, subscriptionId: string, customerId: string, status: string, endDate?: Date): Promise<boolean> {
  if (!supabase) return false;

  const updateData: {
    subscription_id: string;
    stripe_customer_id: string;
    subscription_status: string;
    subscription_end_date?: string;
  } = {
    subscription_id: subscriptionId,
    stripe_customer_id: customerId,
    subscription_status: status,
  };

  if (endDate) {
    updateData.subscription_end_date = endDate.toISOString();
  }

  const { error } = await supabase.from("user_profiles").update(updateData).eq("user_id", userId);

  return !error;
}

/**
 * Get user's profile including subscription info
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single();

  if (error || !data) {
    return null;
  }

  return data as UserProfile;
}
