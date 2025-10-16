import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  trial_used: boolean;
  meal_plans_generated: number;
  subscription_status: string | null;
  subscription_id: string | null;
  stripe_customer_id: string | null;
  subscription_end_date: string | null;
  created_at: string;
}

const FREE_MEAL_PLAN_LIMIT = 2;

/**
 * Check if user can generate meals (either has active subscription or hasn't reached free limit)
 */
export async function canGenerateMeals(userId: string): Promise<{ canGenerate: boolean; reason?: string; remainingFreePlans?: number }> {
  if (!supabase) {
    return { canGenerate: false, reason: "Database connection unavailable" };
  }

  const { data: profile, error } = await supabase.from("user_profiles").select("meal_plans_generated, subscription_status, subscription_end_date").eq("user_id", userId).single();

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

  // Check if user still has free meal plans available
  const generatedCount = profile.meal_plans_generated || 0;
  if (generatedCount < FREE_MEAL_PLAN_LIMIT) {
    return {
      canGenerate: true,
      remainingFreePlans: FREE_MEAL_PLAN_LIMIT - generatedCount,
    };
  }

  return { canGenerate: false, reason: `You've used your ${FREE_MEAL_PLAN_LIMIT} free meal plans - subscription required` };
}

/**
 * Increment the meal plans generated count
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
      trial_used: newCount >= FREE_MEAL_PLAN_LIMIT, // Also mark trial as used when limit reached
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
