import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShoppingListItem {
  recipeId: string;
  recipeName: string;
  ingredients: string[];
  servings: number;
  addedAt: string;
}

interface ConsolidatedIngredient {
  ingredient: string;
  quantity: string;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
          headers: { Authorization: authHeader },
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
    const { items } = await req.json() as { items: ShoppingListItem[] };

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ consolidated: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare the ingredient lists with recipe context
    const ingredientsByRecipe = items.map(item => ({
      recipe: item.recipeName,
      servings: item.servings,
      ingredients: item.ingredients
    }));

    const prompt = `You are a helpful cooking assistant. I have multiple recipes and need to create a consolidated shopping list.

Here are the recipes with their ingredients:

${ingredientsByRecipe.map((recipe, idx) => `
Recipe ${idx + 1}: ${recipe.recipe} (${recipe.servings} servings)
Ingredients:
${recipe.ingredients.map(ing => `- ${ing}`).join('\n')}
`).join('\n')}

Please consolidate these ingredients into a single shopping list. Combine similar ingredients and calculate the total quantities needed. Format your response as a JSON array of objects with the following structure:
[
  {
    "ingredient": "ingredient name",
    "quantity": "total amount needed",
    "notes": "optional notes about combining from different recipes"
  }
]

Rules:
1. Combine similar ingredients (e.g., "2 cups flour" + "1 cup flour" = "3 cups flour")
2. Keep different forms separate (e.g., "fresh basil" vs "dried basil")
3. Be smart about conversions (e.g., tablespoons to cups when appropriate)
4. For items without specific quantities, just list them once
5. Sort by category (produce, proteins, dairy, pantry, etc.)

Return ONLY the JSON array, no additional text.`;

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful cooking assistant that creates consolidated shopping lists. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      throw new Error(error.error?.message || "Failed to consolidate ingredients");
    }

    const data = await openaiResponse.json();
    const content = data.choices[0]?.message?.content?.trim() || "[]";

    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    try {
      // Remove markdown code blocks if present
      const jsonContent = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
      
      const consolidated = JSON.parse(jsonContent) as ConsolidatedIngredient[];
      
      return new Response(JSON.stringify({ consolidated }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Failed to parse consolidated ingredients response");
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
