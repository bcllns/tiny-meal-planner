import { supabase } from "./supabase";
import type { Meal } from "@/types/meal";
import type { SavedRecipe } from "./recipes";

export interface SharedRecipe {
  id: string;
  share_id: string;
  user_id: string;
  recipe_id: string | null;
  name: string;
  description: string | null;
  servings: number;
  prep_time: string | null;
  cook_time: string | null;
  ingredients: string[];
  instructions: string[];
  category: string;
  shared_by_name: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Share a recipe and get a shareable link
 */
export async function shareRecipe(recipe: Meal | SavedRecipe, userName?: string): Promise<{ success: boolean; shareId?: string; shareUrl?: string; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Database connection not available" };
  }

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "You must be signed in to share recipes" };
    }

    // Generate a unique share ID using the database function
    const { data: shareIdData, error: shareIdError } = await supabase.rpc("generate_share_id");

    if (shareIdError || !shareIdData) {
      console.error("Error generating share ID:", shareIdError);
      return { success: false, error: "Failed to generate share link" };
    }

    const shareId = shareIdData as string;

    // Prepare recipe data
    const isSavedRecipe = "meal_id" in recipe;
    const recipeData = {
      share_id: shareId,
      user_id: user.id,
      recipe_id: isSavedRecipe ? (recipe as SavedRecipe).id : null,
      name: recipe.name,
      description: recipe.description || null,
      servings: recipe.servings,
      prep_time: isSavedRecipe ? (recipe as SavedRecipe).prep_time : (recipe as Meal).prepTime,
      cook_time: isSavedRecipe ? (recipe as SavedRecipe).cook_time : (recipe as Meal).cookTime,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      category: recipe.category,
      shared_by_name: userName || null,
    };

    // Insert into shared_recipes table
    const { error: insertError } = await supabase.from("shared_recipes").insert(recipeData);

    if (insertError) {
      console.error("Error sharing recipe:", insertError);
      return { success: false, error: "Failed to share recipe" };
    }

    // Generate the shareable URL
    const shareUrl = `${window.location.origin}?share=${shareId}`;

    return { success: true, shareId, shareUrl };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get a shared recipe by share ID
 */
export async function getSharedRecipe(shareId: string): Promise<{
  success: boolean;
  recipe?: SharedRecipe;
  error?: string;
}> {
  if (!supabase) {
    return { success: false, error: "Database connection not available" };
  }

  try {
    const { data, error } = await supabase.from("shared_recipes").select("*").eq("share_id", shareId).single();

    if (error) {
      console.error("Error fetching shared recipe:", error);
      return { success: false, error: "Recipe not found" };
    }

    if (!data) {
      return { success: false, error: "Recipe not found" };
    }

    // Increment view count
    await supabase.rpc("increment_share_view_count", { share_id_param: shareId });

    return { success: true, recipe: data as SharedRecipe };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all shared recipes by the current user
 */
export async function getUserSharedRecipes(): Promise<{
  success: boolean;
  recipes?: SharedRecipe[];
  error?: string;
}> {
  if (!supabase) {
    return { success: false, error: "Database connection not available" };
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "You must be signed in" };
    }

    const { data, error } = await supabase.from("shared_recipes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching shared recipes:", error);
      return { success: false, error: "Failed to fetch shared recipes" };
    }

    return { success: true, recipes: (data || []) as SharedRecipe[] };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a shared recipe
 */
export async function deleteSharedRecipe(shareId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!supabase) {
    return { success: false, error: "Database connection not available" };
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "You must be signed in" };
    }

    const { error } = await supabase.from("shared_recipes").delete().eq("share_id", shareId).eq("user_id", user.id);

    if (error) {
      console.error("Error deleting shared recipe:", error);
      return { success: false, error: "Failed to delete shared recipe" };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
