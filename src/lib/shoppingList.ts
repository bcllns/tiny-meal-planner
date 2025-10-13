import type { SavedRecipe } from './recipes'
import type { ConsolidatedIngredient } from './consolidateIngredients'

export interface ShoppingListItem {
  recipeId: string
  recipeName: string
  ingredients: string[]
  servings: number
  addedAt: string
}

export interface CachedConsolidatedList {
  recipeIds: string[]
  consolidated: ConsolidatedIngredient[]
  timestamp: string
}

const STORAGE_KEY = 'meal_planner_shopping_list'
const CONSOLIDATED_CACHE_KEY = 'meal_planner_consolidated_list'

export function getShoppingList(): ShoppingListItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading shopping list:', error)
    return []
  }
}

export function addToShoppingList(recipe: SavedRecipe): boolean {
  try {
    const list = getShoppingList()
    
    // Check if recipe is already in the list
    const exists = list.some(item => item.recipeId === recipe.meal_id)
    if (exists) {
      return false
    }

    const newItem: ShoppingListItem = {
      recipeId: recipe.meal_id,
      recipeName: recipe.name,
      ingredients: recipe.ingredients,
      servings: recipe.servings,
      addedAt: new Date().toISOString()
    }

    list.push(newItem)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return true
  } catch (error) {
    console.error('Error adding to shopping list:', error)
    return false
  }
}

export function removeFromShoppingList(recipeId: string): boolean {
  try {
    const list = getShoppingList()
    const filtered = list.filter(item => item.recipeId !== recipeId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Error removing from shopping list:', error)
    return false
  }
}

export function clearShoppingList(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY)
    clearCachedConsolidatedList() // Also clear the consolidated cache
    return true
  } catch (error) {
    console.error('Error clearing shopping list:', error)
    return false
  }
}

export function isInShoppingList(recipeId: string): boolean {
  const list = getShoppingList()
  return list.some(item => item.recipeId === recipeId)
}

// Consolidated list cache management
export function getCachedConsolidatedList(): CachedConsolidatedList | null {
  try {
    const data = localStorage.getItem(CONSOLIDATED_CACHE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error reading cached consolidated list:', error)
    return null
  }
}

export function setCachedConsolidatedList(
  recipeIds: string[],
  consolidated: ConsolidatedIngredient[]
): void {
  try {
    const cache: CachedConsolidatedList = {
      recipeIds: recipeIds.sort(), // Sort to ensure consistent comparison
      consolidated,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(CONSOLIDATED_CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Error caching consolidated list:', error)
  }
}

export function clearCachedConsolidatedList(): void {
  try {
    localStorage.removeItem(CONSOLIDATED_CACHE_KEY)
  } catch (error) {
    console.error('Error clearing cached consolidated list:', error)
  }
}

export function hasShoppingListChanged(): boolean {
  const currentList = getShoppingList()
  const currentRecipeIds = currentList.map(item => item.recipeId).sort()
  
  const cache = getCachedConsolidatedList()
  if (!cache) return true // No cache means we need to consolidate
  
  // Compare recipe IDs to see if the list has changed
  if (currentRecipeIds.length !== cache.recipeIds.length) return true
  
  return !currentRecipeIds.every((id, index) => id === cache.recipeIds[index])
}
