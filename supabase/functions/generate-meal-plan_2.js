import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
/**
 * Generate a simple UUID v4
 */
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
/**
 * Save OpenAI generated meals to the database for tracking
 */
async function saveOpenAIResults(supabaseClient, userId, meals) {
  try {
    const records = meals.map((meal) => ({
      meal_id: meal.id,
      name: meal.name,
      description: meal.description || null,
      servings: meal.servings,
      prep_time: meal.prepTime || null,
      cook_time: meal.cookTime || null,
      ingredients: meal.ingredients,
      instructions: meal.instructions,
      category: meal.category,
      user_id: userId,
    }));
    const { error: insertError } = await supabaseClient
      .from("openai_results")
      .insert(records);
    if (insertError) {
      console.error("Error saving OpenAI results:", insertError);
    }
    return records;
  } catch (err) {
    console.error("Unexpected error saving OpenAI results:", err);
  }
}
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );
    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }
    // Parse request body
    const {
      numberOfPeople,
      mealType,
      notes,
      notInterestedRecipes,
      savedRecipeNames,
    } = await req.json();
    // Build the meal type instruction
    const mealTypeInstruction =
      mealType === "all"
        ? "Include one breakfast, one lunch, and one dinner option."
        : `Generate 9 different ${mealType} options.`;
    //how many results
    //const mealCount = mealType === "all" ? 3 : 5;
    const mealCount = 6;
    // Build the notes instruction
    const notesInstruction = notes?.trim()
      ? `\n\nIMPORTANT: Consider these additional requirements: ${notes.trim()}`
      : "";
    // Build the exclusion instruction for not interested and saved recipes
    const allExcludedRecipes = [
      ...(notInterestedRecipes || []),
      ...(savedRecipeNames || []),
    ];
    const exclusionInstruction =
      allExcludedRecipes.length > 0
        ? `\n\nIMPORTANT: DO NOT suggest any of these recipes or very similar dishes (the user has either marked them as not interested or already saved them): ${allExcludedRecipes.join(
            ", "
          )}.`
        : "";
    // Call OpenAI API
    const context = [
      {
        role: "system",
        content: `You are a professional chef and meal planning assistant. Generate diverse and delicious meal ideas with complete recipes. Always respond with valid JSON only, no additional text.`,
      },
      {
        role: "user",
        content: `Create ${mealCount} different meal ideas with complete recipes for ${numberOfPeople} people. ${mealTypeInstruction}${notesInstruction}${exclusionInstruction}
          
For each meal, provide:
          
1. A creative and appetizing name
2. A brief description (1-2 sentences)
3. Number of servings (adjusted for ${numberOfPeople} people)
4. Preparation time
5. Cooking time
6. A complete list of ingredients with quantities
7. Step-by-step cooking instructions
8. Category (breakfast, lunch, or dinner)

Respond with ONLY a JSON array of meals in this exact format:
[
  {
    "id": "unique-id",
    "name": "Meal Name",
    "description": "Brief description",
    "servings": ${numberOfPeople},
    "prepTime": "15 min",
    "cookTime": "30 min",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"],
    "category": "breakfast|lunch|dinner"
  }
]`,
      },
    ];

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          inputs: context,
          store: false,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      throw new Error(error.error?.message || "Failed to generate meal plan");
    }

    const data = await openaiResponse.json();
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }
    try {
      const meals = JSON.parse(content);
      console.log("From OpenAI", meals);
      let rMeals = [];
      let saveMeals = [];
      for (const meal of meals) {
        //for each meal check if it exists on the table already
        //if so use that meal ID instead of generating a new one
        //and don't save to openai_results again
        const { data: existingMeals, error: fetchError } = await supabaseClient
          .from("openai_results")
          .select("meal_id")
          .eq("name", meal.name)
          .limit(1);
        if (fetchError) {
          console.error("Error checking existing meals:", fetchError);
        }
        let mealId = null;
        if (existingMeals && existingMeals.length > 0) {
          mealId = existingMeals[0].meal_id;
        } else {
          mealId = generateUUID();
          saveMeals.push(meal);
        }

        //not matter what we need to return the meals
        rMeals.push({
          id: mealId,
          name: meal.name,
          description: meal.description || null,
          servings: meal.servings,
          prepTime: meal.prepTime || null,
          cookTime: meal.cookTime || null,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          category: meal.category,
        });
      }
      console.log("After mapping", JSON.stringify(rMeals));
      // Save the OpenAI results to the database (don't await to avoid blocking)
      saveOpenAIResults(supabaseClient, user.id, saveMeals).catch((err) => {
        console.error("Failed to save OpenAI results in background:", err);
      });
      return new Response(
        JSON.stringify({
          meals: rMeals,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      console.error("Parse error:", parseError);
      throw new Error("Failed to parse meal plan response");
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
