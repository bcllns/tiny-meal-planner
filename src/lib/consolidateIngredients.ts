import OpenAI from 'openai'
import type { ShoppingListItem } from './shoppingList'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

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

  // Prepare the ingredient lists with recipe context
  const ingredientsByRecipe = items.map(item => ({
    recipe: item.recipeName,
    servings: item.servings,
    ingredients: item.ingredients
  }))

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

Return ONLY the JSON array, no additional text.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful cooking assistant that creates consolidated shopping lists. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const content = completion.choices[0].message.content?.trim() || '[]'
    
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim()
    
    const consolidated = JSON.parse(jsonContent) as ConsolidatedIngredient[]
    return consolidated
  } catch (error) {
    console.error('Error consolidating ingredients:', error)
    throw new Error('Failed to consolidate ingredients. Please try again.')
  }
}
