import { supabase } from './supabase'

/**
 * Mark a recipe as "not interested" for the current user
 */
export async function markAsNotInterested(
  mealId: string,
  recipeName: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Database connection not available' }
  }

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'You must be signed in to mark recipes as not interested' }
    }

    // Insert into not_interested table
    const { error: insertError } = await supabase
      .from('not_interested')
      .insert({
        user_id: user.id,
        meal_id: mealId,
        recipe_name: recipeName
      })

    if (insertError) {
      // Check if it's a duplicate entry error
      if (insertError.code === '23505') {
        return { success: true } // Already marked, treat as success
      }
      console.error('Error marking recipe as not interested:', insertError)
      return { success: false, error: 'Failed to mark recipe as not interested' }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Remove a recipe from the "not interested" list
 */
export async function removeFromNotInterested(
  mealId: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Database connection not available' }
  }

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'You must be signed in' }
    }

    // Delete from not_interested table
    const { error: deleteError } = await supabase
      .from('not_interested')
      .delete()
      .eq('user_id', user.id)
      .eq('meal_id', mealId)

    if (deleteError) {
      console.error('Error removing recipe from not interested:', deleteError)
      return { success: false, error: 'Failed to remove recipe from not interested' }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Check if a recipe is marked as "not interested"
 */
export async function checkIfNotInterested(mealId: string): Promise<boolean> {
  if (!supabase) {
    return false
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return false
    }

    const { data, error } = await supabase
      .from('not_interested')
      .select('id')
      .eq('user_id', user.id)
      .eq('meal_id', mealId)
      .maybeSingle()

    if (error) {
      console.error('Error checking not interested status:', error)
      return false
    }

    return !!data
  } catch (err) {
    console.error('Unexpected error:', err)
    return false
  }
}

/**
 * Get all recipes marked as "not interested" for the current user
 */
export async function getNotInterestedRecipes(): Promise<{
  success: boolean
  data?: Array<{ id: string; meal_id: string; recipe_name: string; created_at: string }>
  error?: string
}> {
  if (!supabase) {
    return { success: false, error: 'Database connection not available' }
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'You must be signed in' }
    }

    const { data, error } = await supabase
      .from('not_interested')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching not interested recipes:', error)
      return { success: false, error: 'Failed to fetch not interested recipes' }
    }

    return { success: true, data: data || [] }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
