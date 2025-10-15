import type { Meal } from "@/types/meal";
import { getNotInterestedRecipes } from "./notInterested";
import { getSavedRecipes } from "./recipes";
import { supabase } from "./supabase";

export async function generateMealPlan(
  numberOfPeople: number, 
  mealType: string = "all", 
  notes: string = ""
): Promise<Meal[]> {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  // Get the current session to include auth token
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("You must be logged in to generate meal plans.");
  }

  // Fetch recipes the user is not interested in
  const notInterestedResult = await getNotInterestedRecipes();
  const notInterestedRecipes = notInterestedResult.success && notInterestedResult.data 
    ? notInterestedResult.data.map(recipe => recipe.recipe_name)
    : [];

  // Fetch recipes the user has already saved
  const savedRecipes = await getSavedRecipes();
  const savedRecipeNames = savedRecipes.map(recipe => recipe.name);

  // Call the Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
    body: {
      numberOfPeople,
      mealType,
      notes,
      notInterestedRecipes,
      savedRecipeNames,
    },
  });

  if (error) {
    console.error("Error calling generate-meal-plan function:", error);
    throw new Error(error.message || "Failed to generate meal plan");
  }

  if (!data?.meals) {
    throw new Error("No meals received from the server");
  }

  return data.meals;
}
