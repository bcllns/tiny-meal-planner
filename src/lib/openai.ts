import type { Meal } from "@/types/meal";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function generateMealPlan(
  numberOfPeople: number, 
  mealType: string = "all", 
  notes: string = ""
): Promise<Meal[]> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.");
  }

  // Build the meal type instruction
  const mealTypeInstruction = mealType === "all" 
    ? "Include one breakfast, one lunch, and one dinner option."
    : `Generate 3 different ${mealType} options.`;

  // Build the notes instruction
  const notesInstruction = notes.trim() 
    ? `\n\nIMPORTANT: Consider these additional requirements: ${notes.trim()}`
    : "";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
          content: `You are a professional chef and meal planning assistant. Generate diverse and delicious meal ideas with complete recipes. Always respond with valid JSON only, no additional text.`
        },
        {
          role: "user",
          content: `Create 5 different meal ideas with complete recipes for ${numberOfPeople} people. ${mealTypeInstruction}${notesInstruction}
          
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
]`
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to generate meal plan");
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content received from OpenAI");
  }

  try {
    const meals = JSON.parse(content);
    return meals;
  } catch {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error("Failed to parse meal plan response");
  }
}
