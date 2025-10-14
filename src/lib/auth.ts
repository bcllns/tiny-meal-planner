import { supabase } from "./supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/user";

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  if (!supabase) {
    return null;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Try to get profile from user_profiles table
    const { data: profile, error: profileError } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);

      // If profile doesn't exist, create it
      if (profileError.code === "PGRST116") {
        // No rows returned
        const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

        const { data: newProfile, error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: user.id,
            email: user.email || "",
            full_name: fullName,
            trial_used: false,
            subscription_status: null,
            subscription_id: null,
            stripe_customer_id: null,
            subscription_end_date: null,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating user profile:", insertError);
          // Fallback to basic profile
          return {
            id: user.id,
            email: user.email || "",
            full_name: fullName,
            created_at: user.created_at,
            trial_used: false,
          };
        }

        return newProfile as UserProfile;
      }

      // For other errors, return basic profile
      const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
      return {
        id: user.id,
        email: user.email || "",
        full_name: fullName,
        created_at: user.created_at,
        trial_used: false,
      };
    }

    return profile as UserProfile;
  } catch (error) {
    console.error("Get user profile error:", error);
    return null;
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  if (!supabase) {
    return { user: null, error: "Supabase is not configured" };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    // Note: User profile is automatically created by database trigger
    // See: database/create_user_profiles_with_trigger.sql
    console.log("User signed up successfully:", data.user?.email);
    console.log("Profile will be created automatically by database trigger");

    return { user: data.user, error: null };
  } catch (error) {
    console.error("Sign up error:", error);
    return { user: null, error: "An unexpected error occurred during sign up" };
  }
}

export async function signIn(email: string, password: string) {
  if (!supabase) {
    return { user: null, error: "Supabase is not configured" };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error("Sign in error:", error);
    return { user: null, error: "An unexpected error occurred during sign in" };
  }
}

export async function signOut() {
  if (!supabase) {
    return { error: "Supabase is not configured" };
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return { error: "An unexpected error occurred during sign out" };
  }
}

export async function getCurrentUser() {
  if (!supabase) {
    return null;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

export async function getSession() {
  if (!supabase) {
    return null;
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

export function onAuthStateChange(callback: (user: SupabaseUser | null) => void) {
  if (!supabase) {
    return { unsubscribe: () => {} };
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return {
    unsubscribe: () => subscription.unsubscribe(),
  };
}

export async function resetPassword(email: string) {
  if (!supabase) {
    return { error: "Supabase is not configured" };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "An unexpected error occurred while sending reset email" };
  }
}

export async function updatePassword(newPassword: string) {
  if (!supabase) {
    return { error: "Supabase is not configured" };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    // Sign out the user so they must sign in with their new password
    await supabase.auth.signOut();

    return { error: null };
  } catch (error) {
    console.error("Update password error:", error);
    return { error: "An unexpected error occurred while updating password" };
  }
}
