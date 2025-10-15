import type { SavedRecipe } from "./recipes";
import type { ConsolidatedIngredient } from "./consolidateIngredients";
import { supabase } from "./supabase";

export interface ShoppingListItem {
  recipeId: string;
  recipeName: string;
  ingredients: string[];
  servings: number;
  addedAt: string;
}

export interface CachedConsolidatedList {
  recipeIds: string[];
  consolidated: ConsolidatedIngredient[];
  timestamp: string;
}

/**
 * Get the current shopping list from Supabase
 */
export async function getShoppingList(userId: string | null = null): Promise<ShoppingListItem[]> {
  if (!userId || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase.from("shopping_lists").select("recipe_data").eq("user_id", userId).single();

    if (error) {
      // If no row exists yet, return empty array
      if (error.code === "PGRST116") {
        return [];
      }
      console.error("Error fetching shopping list:", error);
      return [];
    }

    return data?.recipe_data || [];
  } catch (err) {
    console.error("Exception fetching shopping list:", err);
    return [];
  }
}

/**
 * Add a recipe to the shopping list
 */
export async function addToShoppingList(recipe: SavedRecipe, userId: string | null = null): Promise<boolean> {
  if (!userId || !supabase) {
    console.error("User ID and supabase client are required to add to shopping list");
    return false;
  }

  try {
    // Get current list
    const currentList = await getShoppingList(userId);

    // Check if recipe is already in the list
    const exists = currentList.some((item) => item.recipeId === recipe.meal_id);
    if (exists) {
      return false; // Don't add duplicates
    }

    const newItem: ShoppingListItem = {
      recipeId: recipe.meal_id,
      recipeName: recipe.name,
      ingredients: recipe.ingredients,
      servings: recipe.servings,
      addedAt: new Date().toISOString(),
    };

    const updatedList = [...currentList, newItem];

    // Upsert the shopping list (insert or update)
    const { error } = await supabase.from("shopping_lists").upsert({
      user_id: userId,
      recipe_data: updatedList,
      // Clear consolidated_ingredients when adding new recipe
      consolidated_ingredients: null,
    });

    if (error) {
      console.error("Error adding to shopping list:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception adding to shopping list:", err);
    return false;
  }
}

/**
 * Remove a recipe from the shopping list
 */
export async function removeFromShoppingList(recipeId: string, userId: string | null = null): Promise<boolean> {
  if (!userId || !supabase) {
    console.error("User ID and supabase client are required to remove from shopping list");
    return false;
  }

  try {
    const currentList = await getShoppingList(userId);
    const updatedList = currentList.filter((item) => item.recipeId !== recipeId);

    // Upsert the updated list
    const { error } = await supabase.from("shopping_lists").upsert({
      user_id: userId,
      recipe_data: updatedList,
      // Clear consolidated_ingredients when removing recipe
      consolidated_ingredients: null,
    });

    if (error) {
      console.error("Error removing from shopping list:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception removing from shopping list:", err);
    return false;
  }
}

/**
 * Clear the entire shopping list
 */
export async function clearShoppingList(userId: string | null = null): Promise<boolean> {
  if (!userId || !supabase) {
    console.error("User ID and supabase client are required to clear shopping list");
    return false;
  }

  try {
    const { error } = await supabase.from("shopping_lists").delete().eq("user_id", userId);

    if (error) {
      console.error("Error clearing shopping list:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception clearing shopping list:", err);
    return false;
  }
}

/**
 * Check if a recipe is in the shopping list
 */
export async function isInShoppingList(recipeId: string, userId: string | null = null): Promise<boolean> {
  const list = await getShoppingList(userId);
  return list.some((item) => item.recipeId === recipeId);
}

/**
 * Get cached consolidated list from Supabase
 */
export async function getCachedConsolidatedList(userId: string | null = null): Promise<CachedConsolidatedList | null> {
  if (!userId || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.from("shopping_lists").select("consolidated_ingredients, recipe_data").eq("user_id", userId).single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching cached consolidated list:", error);
      return null;
    }

    if (!data?.consolidated_ingredients) {
      return null;
    }

    // Build cache object from database data
    const recipeIds = (data.recipe_data || []).map((item: ShoppingListItem) => item.recipeId).sort();

    return {
      recipeIds,
      consolidated: data.consolidated_ingredients,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Exception fetching cached consolidated list:", err);
    return null;
  }
}

/**
 * Set cached consolidated list in Supabase
 */
export async function setCachedConsolidatedList(_recipeIds: string[], consolidated: ConsolidatedIngredient[], userId: string | null = null): Promise<void> {
  if (!userId || !supabase) {
    console.error("User ID and supabase client are required to cache consolidated list");
    return;
  }

  try {
    // Get current recipe data to preserve it
    const currentList = await getShoppingList(userId);

    // Update the consolidated_ingredients field
    const { error } = await supabase.from("shopping_lists").upsert({
      user_id: userId,
      recipe_data: currentList,
      consolidated_ingredients: consolidated,
    });

    if (error) {
      console.error("Error caching consolidated list:", error);
    }
  } catch (err) {
    console.error("Exception caching consolidated list:", err);
  }
}

/**
 * Clear cached consolidated list (not used anymore since we clear the whole row)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function clearCachedConsolidatedList(_userId: string | null = null): Promise<void> {
  // This is now handled by clearShoppingList or by setting consolidated_ingredients to null
  // Keeping this function for backward compatibility but it's a no-op
  return;
}

/**
 * Check if the shopping list has changed since the last consolidation
 */
export async function hasShoppingListChanged(userId: string | null = null): Promise<boolean> {
  if (!userId) {
    return true;
  }

  try {
    const currentList = await getShoppingList(userId);
    const currentRecipeIds = currentList.map((item) => item.recipeId).sort();

    const cache = await getCachedConsolidatedList(userId);
    if (!cache) return true; // No cache means we need to consolidate

    // Compare recipe IDs to see if the list has changed
    if (currentRecipeIds.length !== cache.recipeIds.length) return true;

    return !currentRecipeIds.every((id, index) => id === cache.recipeIds[index]);
  } catch (err) {
    console.error("Exception checking shopping list changes:", err);
    return true; // On error, assume it changed
  }
}

/**
 * Share a shopping list by saving consolidated ingredients to shared_shopping_lists table
 * Returns the share ID if successful, null otherwise
 */
export async function shareShoppingList(consolidatedIngredients: ConsolidatedIngredient[], userId: string | null = null): Promise<string | null> {
  if (!userId || !supabase) {
    console.error("User ID and supabase client are required to share shopping list");
    return null;
  }

  if (!consolidatedIngredients || consolidatedIngredients.length === 0) {
    console.error("Cannot share empty shopping list");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("shared_shopping_lists")
      .insert({
        user_id: userId,
        consolidated_ingredients: consolidatedIngredients,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error sharing shopping list:", error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error("Exception sharing shopping list:", err);
    return null;
  }
}

/**
 * Get a shared shopping list by ID (public access, no auth required)
 */
export async function getSharedShoppingList(shareId: string): Promise<{ consolidatedIngredients: ConsolidatedIngredient[]; sharedBy: string } | null> {
  if (!shareId || !supabase) {
    return null;
  }

  try {
    // First, get the shared shopping list
    const { data: shoppingListData, error: listError } = await supabase.from("shared_shopping_lists").select("consolidated_ingredients, user_id").eq("id", shareId).single();

    if (listError) {
      console.error("Error fetching shared shopping list:", listError);
      return null;
    }

    if (!shoppingListData) {
      return null;
    }

    // Then, get the user profile to fetch the name
    let sharedBy = "Someone";
    if (shoppingListData.user_id) {
      const { data: profileData, error: profileError } = await supabase.from("user_profiles").select("full_name").eq("user_id", shoppingListData.user_id).single();

      if (!profileError && profileData?.full_name) {
        sharedBy = profileData.full_name;
      }
    }

    return {
      consolidatedIngredients: shoppingListData.consolidated_ingredients || [],
      sharedBy,
    };
  } catch (err) {
    console.error("Exception fetching shared shopping list:", err);
    return null;
  }
}
