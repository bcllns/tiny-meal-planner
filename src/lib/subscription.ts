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
 * Calculate how many days are remaining in the trial
 */
export function getTrialDaysRemaining(trialStartDate: string): number {
  const startDate = new Date(trialStartDate);
  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + TRIAL_DURATION_DAYS);
  
  const now = new Date();
  const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysRemaining);
}

/**
 * Get the trial expiry date
 */
export function getTrialExpiryDate(trialStartDate: string): Date {
  const startDate = new Date(trialStartDate);
  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + TRIAL_DURATION_DAYS);
  return expiryDate;
}

/**
 * Check if user's trial has expired
 */
export function isTrialExpired(trialStartDate: string): boolean {
  return getTrialDaysRemaining(trialStartDate) <= 0;
}

/**
 * Check if user can generate meals (either has active subscription or trial hasn't expired)
 */
export async function canGenerateMeals(userId: string): Promise<{ canGenerate: boolean; reason?: string; trialDaysRemaining?: number; trialExpiryDate?: Date }> {
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

  // Check if user's trial is still active
  const trialStartDate = profile.trial_start_date || new Date().toISOString();
  const daysRemaining = getTrialDaysRemaining(trialStartDate);
  const expiryDate = getTrialExpiryDate(trialStartDate);
  
  if (daysRemaining > 0) {
    return {
      canGenerate: true,
      trialDaysRemaining: daysRemaining,
      trialExpiryDate: expiryDate,
    };
  }

  return { canGenerate: false, reason: "Your 7-day trial has expired - subscription required" };
}

/**
 * Increment the meal plans generated count
 */
export async function incrementMealPlanCount(userId: string): Promise<{ success: boolean; newCount?: number }> {
  if (!supabase) return { success: false };

  // First get the current count and trial start date
  const { data: profile, error: fetchError } = await supabase.from("user_profiles").select("meal_plans_generated, trial_start_date").eq("user_id", userId).single();

  if (fetchError || !profile) {
    return { success: false };
  }

  const currentCount = profile.meal_plans_generated || 0;
  const newCount = currentCount + 1;

  // Check if trial has expired based on date
  const trialStartDate = profile.trial_start_date || new Date().toISOString();
  const trialExpired = isTrialExpired(trialStartDate);

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      meal_plans_generated: newCount,
      trial_used: trialExpired, // Mark trial as used if expired
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
