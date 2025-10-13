import { useEffect, useState } from 'react'
import { getSavedRecipes, deleteRecipe, type SavedRecipe } from '@/lib/recipes'
import { useRecipeContext } from '@/contexts/RecipeContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users, Trash2, RefreshCw, ChefHat } from 'lucide-react'

interface SavedRecipesProps {
  onPlanMeals: () => void
  onRecipesLoaded: (count: number) => void
}

export function SavedRecipes({ onPlanMeals, onRecipesLoaded }: SavedRecipesProps) {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { refreshTrigger, triggerRefresh } = useRecipeContext()

  const fetchRecipes = async () => {
    setIsLoading(true)
    const savedRecipes = await getSavedRecipes()
    setRecipes(savedRecipes)
    setIsLoading(false)
    // Notify parent component of recipe count
    onRecipesLoaded(savedRecipes.length)
  }

  useEffect(() => {
    fetchRecipes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]) // Re-fetch when refreshTrigger changes

  const handleDelete = async (mealId: string) => {
    setDeletingId(mealId)
    const result = await deleteRecipe(mealId)
    
    if (result.success) {
      // Remove from local state
      setRecipes(recipes.filter(recipe => recipe.meal_id !== mealId))
      // Notify other components
      triggerRefresh()
    } else {
      alert(`Failed to delete recipe: ${result.error}`)
    }
    
    setDeletingId(null)
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 mb-4">
          <RefreshCw className="h-6 w-6 text-emerald-600 animate-spin" />
        </div>
        <p className="text-muted-foreground">Loading your saved recipes...</p>
      </div>
    )
  }

  if (recipes.length === 0) {
    return null // Don't show anything if there are no saved recipes
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Your Saved Recipes</h2>
          <p className="text-muted-foreground">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved</p>
        </div>
        <Button 
          onClick={onPlanMeals} 
          className="gap-2"
        >
          <ChefHat className="h-4 w-4" />
          Plan Meals
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Card 
            key={recipe.id} 
            className="overflow-hidden border-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 hover:shadow-lg flex flex-col"
          >
            <CardHeader className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
              <CardTitle className="text-xl">{recipe.name}</CardTitle>
              {recipe.description && (
                <CardDescription className="text-sm">{recipe.description}</CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="pt-6 space-y-4 flex-1">
              {/* Metadata */}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} servings</span>
                </div>
                {recipe.prep_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.prep_time}</span>
                  </div>
                )}
              </div>

              {/* Category Badge */}
              <div>
                <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                  {recipe.category}
                </span>
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="font-semibold mb-2 text-sm">Ingredients</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span className="flex-1">{ingredient}</span>
                    </li>
                  ))}
                  {recipe.ingredients.length > 3 && (
                    <li className="text-xs italic">+ {recipe.ingredients.length - 3} more...</li>
                  )}
                </ul>
              </div>

              {/* Instructions Preview */}
              <div>
                <h4 className="font-semibold mb-2 text-sm">Instructions</h4>
                <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  {recipe.instructions.slice(0, 2).map((instruction, idx) => (
                    <li key={idx} className="leading-relaxed">{instruction}</li>
                  ))}
                  {recipe.instructions.length > 2 && (
                    <li className="text-xs italic">+ {recipe.instructions.length - 2} more steps...</li>
                  )}
                </ol>
              </div>
            </CardContent>

            <CardFooter className="pt-4 border-t">
              <Button
                onClick={() => handleDelete(recipe.meal_id)}
                disabled={deletingId === recipe.meal_id}
                variant="destructive"
                className="w-full gap-2"
              >
                {deletingId === recipe.meal_id ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Recipe
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
