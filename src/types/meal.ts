export interface Meal {
  id: string;
  name: string;
  description: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  ingredients: string[];
  instructions: string[];
  category: string;
}

export interface MealPlanResponse {
  meals: Meal[];
}
