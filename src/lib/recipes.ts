import { supabase } from './supabase'
import { getCurrentUser } from './auth'
import { generateUUID } from './utils'
import type { Meal } from '@/types/meal'

export interface SavedRecipe {
  id: string
  meal_id: string
  name: string
  description: string | null
  servings: number
  prep_time: string | null
  cook_time: string | null
  ingredients: string[]
  instructions: string[]
  category: string
  user_id: string | null
  notes: string | null
  rating: number | null
  created_at: string
  updated_at: string
}

export async function saveRecipe(meal: Meal): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured. Please add your Supabase credentials to .env' }
  }

  try {
    // Get current user
    const currentUser = await getCurrentUser()
    
    // Generate a proper UUID for the meal_id
    const mealId = generateUUID()
    
    const { error } = await supabase
      .from('recipes')
      .insert({
        meal_id: mealId,
        name: meal.name,
        description: meal.description,
        servings: meal.servings,
        prep_time: meal.prepTime,
        cook_time: meal.cookTime,
        ingredients: meal.ingredients,
        instructions: meal.instructions,
        category: meal.category,
        user_id: currentUser?.id || null,
      })

    if (error) {
      console.error('Error saving recipe:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error saving recipe:', error)
    return { success: false, error: 'An unexpected error occurred while saving the recipe' }
  }
}

export async function checkIfRecipeSaved(mealId: string): Promise<boolean> {
  if (!supabase) return false

  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id')
      .eq('meal_id', mealId)
      .maybeSingle()

    if (error) {
      console.error('Error checking recipe:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Unexpected error checking recipe:', error)
    return false
  }
}

export async function getSavedRecipes(): Promise<SavedRecipe[]> {
  if (!supabase) return []

  try {
    // Get current user to filter recipes
    const currentUser = await getCurrentUser()
    if (!currentUser) return []

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching recipes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error fetching recipes:', error)
    return []
  }
}

export async function deleteRecipe(mealId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' }
  }

  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('meal_id', mealId)

    if (error) {
      console.error('Error deleting recipe:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting recipe:', error)
    return { success: false, error: 'An unexpected error occurred while deleting the recipe' }
  }
}

export async function updateRecipeNotesAndRating(
  recipeId: string,
  notes: string | null,
  rating: number | null
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' }
  }

  try {
    const { error } = await supabase
      .from('recipes')
      .update({ notes, rating })
      .eq('id', recipeId)

    if (error) {
      console.error('Error updating recipe notes/rating:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error updating recipe notes/rating:', error)
    return { success: false, error: 'An unexpected error occurred while updating the recipe' }
  }
}
