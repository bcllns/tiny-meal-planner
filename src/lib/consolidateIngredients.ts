import type { ShoppingListItem } from './shoppingList'
import { supabase } from './supabase'

export interface ConsolidatedIngredient {
  ingredient: string
  quantity: string
  notes?: string
}

export async function consolidateIngredients(
  items: ShoppingListItem[]
): Promise<ConsolidatedIngredient[]> {
  if (items.length === 0) {
    return []
  }

  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  // Get the current session to include auth token
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("You must be logged in to consolidate ingredients.");
  }

  try {
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('consolidate-ingredients', {
      body: { items },
    });

    if (error) {
      console.error("Error calling consolidate-ingredients function:", error);
      throw new Error(error.message || "Failed to consolidate ingredients");
    }

    if (!data?.consolidated) {
      throw new Error("No consolidated ingredients received from the server");
    }

    return data.consolidated;
  } catch (error) {
    console.error('Error consolidating ingredients:', error)
    throw new Error('Failed to consolidate ingredients. Please try again.')
  }
}
