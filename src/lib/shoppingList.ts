import type { SavedRecipe } from "./recipes";
import type { ConsolidatedIngredient } from "./consolidateIngredients";

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

const STORAGE_KEY_PREFIX = "meal_planner_shopping_list";
const CONSOLIDATED_CACHE_KEY_PREFIX = "meal_planner_consolidated_list";

/**
 * Get user-specific storage key
 */
function getStorageKey(userId: string | null): string {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

/**
 * Get user-specific consolidated cache key
 */
function getConsolidatedCacheKey(userId: string | null): string {
  return userId ? `${CONSOLIDATED_CACHE_KEY_PREFIX}_${userId}` : CONSOLIDATED_CACHE_KEY_PREFIX;
}

export function getShoppingList(userId: string | null = null): ShoppingListItem[] {
  try {
    const data = localStorage.getItem(getStorageKey(userId));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading shopping list:", error);
    return [];
  }
}

export function addToShoppingList(recipe: SavedRecipe, userId: string | null = null): boolean {
  try {
    const list = getShoppingList(userId);

    // Check if recipe is already in the list
    const exists = list.some((item) => item.recipeId === recipe.meal_id);
    if (exists) {
      return false;
    }

    const newItem: ShoppingListItem = {
      recipeId: recipe.meal_id,
      recipeName: recipe.name,
      ingredients: recipe.ingredients,
      servings: recipe.servings,
      addedAt: new Date().toISOString(),
    };

    list.push(newItem);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(list));
    return true;
  } catch (error) {
    console.error("Error adding to shopping list:", error);
    return false;
  }
}

export function removeFromShoppingList(recipeId: string, userId: string | null = null): boolean {
  try {
    const list = getShoppingList(userId);
    const filtered = list.filter((item) => item.recipeId !== recipeId);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error removing from shopping list:", error);
    return false;
  }
}

export function clearShoppingList(userId: string | null = null): boolean {
  try {
    localStorage.removeItem(getStorageKey(userId));
    clearCachedConsolidatedList(userId); // Also clear the consolidated cache
    return true;
  } catch (error) {
    console.error("Error clearing shopping list:", error);
    return false;
  }
}

export function isInShoppingList(recipeId: string, userId: string | null = null): boolean {
  const list = getShoppingList(userId);
  return list.some((item) => item.recipeId === recipeId);
}

// Consolidated list cache management
export function getCachedConsolidatedList(userId: string | null = null): CachedConsolidatedList | null {
  try {
    const data = localStorage.getItem(getConsolidatedCacheKey(userId));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error reading cached consolidated list:", error);
    return null;
  }
}

export function setCachedConsolidatedList(recipeIds: string[], consolidated: ConsolidatedIngredient[], userId: string | null = null): void {
  try {
    const cache: CachedConsolidatedList = {
      recipeIds: recipeIds.sort(), // Sort to ensure consistent comparison
      consolidated,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(getConsolidatedCacheKey(userId), JSON.stringify(cache));
  } catch (error) {
    console.error("Error caching consolidated list:", error);
  }
}

export function clearCachedConsolidatedList(userId: string | null = null): void {
  try {
    localStorage.removeItem(getConsolidatedCacheKey(userId));
  } catch (error) {
    console.error("Error clearing cached consolidated list:", error);
  }
}

export function hasShoppingListChanged(userId: string | null = null): boolean {
  const currentList = getShoppingList(userId);
  const currentRecipeIds = currentList.map((item) => item.recipeId).sort();

  const cache = getCachedConsolidatedList(userId);
  if (!cache) return true; // No cache means we need to consolidate

  // Compare recipe IDs to see if the list has changed
  if (currentRecipeIds.length !== cache.recipeIds.length) return true;

  return !currentRecipeIds.every((id, index) => id === cache.recipeIds[index]);
}
