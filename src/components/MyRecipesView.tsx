import { useEffect, useState, useRef } from 'react'
import { getSavedRecipes, deleteRecipe, type SavedRecipe } from '@/lib/recipes'
import { addToShoppingList, removeFromShoppingList, isInShoppingList } from '@/lib/shoppingList'
import { useRecipeContext } from '@/contexts/RecipeContext'
import { RecipeNotesDialog } from '@/components/RecipeNotesDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Clock, Users, ChefHat, Trash2, Loader2, RefreshCw, Star, StickyNote, Menu, Printer, ListPlus, ListCheck } from 'lucide-react'

export function MyRecipesView() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [shoppingListItems, setShoppingListItems] = useState<Set<string>>(new Set())
  const [notesDialogRecipe, setNotesDialogRecipe] = useState<SavedRecipe | null>(null)
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const { refreshTrigger } = useRecipeContext()
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true)
      const savedRecipes = await getSavedRecipes()
      setRecipes(savedRecipes)
      
      // Update shopping list status for all recipes
      const inList = new Set<string>()
      savedRecipes.forEach(recipe => {
        if (isInShoppingList(recipe.meal_id)) {
          inList.add(recipe.meal_id)
        }
      })
      setShoppingListItems(inList)
      
      setIsLoading(false)
    }

    fetchRecipes()
  }, [refreshTrigger])

  const handleDelete = async (mealId: string) => {
    setOpenPopoverId(null)
    setDeletingId(mealId)
    const result = await deleteRecipe(mealId)
    
    if (result.success) {
      setRecipes(recipes.filter(recipe => recipe.meal_id !== mealId))
      // Also remove from shopping list if present
      if (shoppingListItems.has(mealId)) {
        removeFromShoppingList(mealId)
        setShoppingListItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(mealId)
          return newSet
        })
      }
    } else {
      alert(`Failed to delete recipe: ${result.error}`)
    }
    
    setDeletingId(null)
  }

  const handleToggleShoppingList = (recipe: SavedRecipe) => {
    setOpenPopoverId(null)
    const isInList = shoppingListItems.has(recipe.meal_id)
    
    if (isInList) {
      removeFromShoppingList(recipe.meal_id)
      setShoppingListItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(recipe.meal_id)
        return newSet
      })
    } else {
      const success = addToShoppingList(recipe)
      if (success) {
        setShoppingListItems(prev => new Set(prev).add(recipe.meal_id))
      } else {
        alert('This recipe is already in your shopping list')
      }
    }
  }

  const handlePrint = (recipe: SavedRecipe) => {
    setOpenPopoverId(null)
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${recipe.name} - Recipe</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #059669;
              margin-bottom: 8px;
            }
            .description {
              color: #6b7280;
              margin-bottom: 20px;
            }
            .meta {
              display: flex;
              gap: 20px;
              margin-bottom: 20px;
              padding: 15px;
              background: #f0fdf4;
              border-radius: 8px;
            }
            .meta-item {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .rating {
              display: flex;
              gap: 4px;
              align-items: center;
            }
            .notes {
              background: #f9fafb;
              border-left: 3px solid #059669;
              padding: 12px;
              margin-bottom: 20px;
              font-style: italic;
              color: #4b5563;
            }
            h2 {
              color: #059669;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-top: 24px;
              margin-bottom: 12px;
            }
            ul {
              list-style: none;
              padding: 0;
            }
            li {
              margin-bottom: 8px;
              padding-left: 20px;
              position: relative;
            }
            ul li:before {
              content: "•";
              color: #059669;
              position: absolute;
              left: 0;
            }
            ol {
              padding-left: 0;
              counter-reset: step;
            }
            ol li {
              counter-increment: step;
              margin-bottom: 12px;
              padding-left: 30px;
              position: relative;
            }
            ol li:before {
              content: counter(step) ".";
              color: #059669;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${recipe.name}</h1>
          ${recipe.description ? `<div class="description">${recipe.description}</div>` : ''}
          <div class="meta">
            <div class="meta-item">
              <span>👥 ${recipe.servings} servings</span>
            </div>
            ${recipe.prep_time ? `<div class="meta-item"><span>⏱️ Prep: ${recipe.prep_time}${recipe.cook_time ? ` / Cook: ${recipe.cook_time}` : ''}</span></div>` : ''}
            ${recipe.rating ? `<div class="meta-item"><span>⭐ ${recipe.rating}/5</span></div>` : ''}
          </div>
          ${recipe.notes ? `<div class="notes">${recipe.notes}</div>` : ''}
          <h2>Ingredients</h2>
          <ul>
            ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
          </ul>
          <h2>Instructions</h2>
          <ol>
            ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
          </ol>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  const handleOpenNotesDialog = (recipe: SavedRecipe) => {
    setOpenPopoverId(null)
    setNotesDialogRecipe(recipe)
  }

  const handleUpdateRecipe = async () => {
    // Re-fetch recipes to get updated data
    const savedRecipes = await getSavedRecipes()
    setRecipes(savedRecipes)
  }

  // Filter recipes by category
  const filteredRecipes = selectedCategory === 'All' 
    ? recipes 
    : recipes.filter(recipe => recipe.category.toLowerCase() === selectedCategory.toLowerCase())

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner']
  
  // Get count for each category
  const getCategoryCount = (category: string) => {
    if (category === 'All') return recipes.length
    return recipes.filter(r => r.category.toLowerCase() === category.toLowerCase()).length
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
    return (
      <div className="text-center py-16">
        <div className="mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <ChefHat className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Saved Recipes Yet</h2>
        <p className="text-muted-foreground mb-6">
          Start planning meals and save your favorite recipes to see them here.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">My Saved Recipes</h2>
        <p className="text-muted-foreground">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved</p>
        
        {/* Category Filter */}
        {recipes.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category}
                <span className="ml-2 text-xs opacity-75">
                  ({getCategoryCount(category)})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredRecipes.length === 0 && recipes.length > 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto bg-gradient-to-br from-gray-400 to-gray-500 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <ChefHat className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No {selectedCategory} Recipes</h2>
          <p className="text-muted-foreground mb-6">
            You don't have any saved recipes in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
          <Card 
            key={recipe.id} 
            ref={(el) => { cardRefs.current[recipe.id] = el }}
            className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
          >
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    {shoppingListItems.has(recipe.meal_id) && (
                      <ListCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    )}
                    <CardTitle className="text-xl">{recipe.name}</CardTitle>
                  </div>
                  {recipe.description && (
                    <CardDescription className="text-sm">{recipe.description}</CardDescription>
                  )}
                </div>
                <Popover open={openPopoverId === recipe.id} onOpenChange={(open) => setOpenPopoverId(open ? recipe.id : null)}>
                  <PopoverTrigger asChild>
                    <button className="bg-white dark:bg-gray-800 rounded-full p-2 ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Menu className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="end">
                    <div className="space-y-1">
                      <button
                        onClick={() => handleToggleShoppingList(recipe)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md text-left"
                      >
                        {shoppingListItems.has(recipe.meal_id) ? (
                          <>
                            <ListCheck className="h-4 w-4 text-emerald-600" />
                            <span>Remove from Shopping List</span>
                          </>
                        ) : (
                          <>
                            <ListPlus className="h-4 w-4" />
                            <span>Add to Shopping List</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenNotesDialog(recipe)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md text-left"
                      >
                        <StickyNote className="h-4 w-4" />
                        <span>Notes / Rating</span>
                      </button>
                      <button
                        onClick={() => handlePrint(recipe)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md text-left"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Print</span>
                      </button>
                      <div className="border-t my-1"></div>
                      <button
                        onClick={() => handleDelete(recipe.meal_id)}
                        disabled={deletingId === recipe.meal_id}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors rounded-md text-left disabled:opacity-50"
                      >
                        {deletingId === recipe.meal_id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Recipe</span>
                          </>
                        )}
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} servings</span>
                </div>
                {recipe.prep_time && (
                  <div className="flex items-center gap-1" title={`Prep time: ${recipe.prep_time}${recipe.cook_time ? ` / Cook time: ${recipe.cook_time}` : ''}`}>
                    <Clock className="h-4 w-4" />
                    <span>{recipe.prep_time}{recipe.cook_time ? ` / ${recipe.cook_time}` : ''}</span>
                  </div>
                )}
                {recipe.rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < recipe.rating!
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Notes Preview */}
              {recipe.notes && (
                <div className="mt-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded text-xs text-muted-foreground italic border-l-2 border-emerald-500">
                  <span className="block truncate">
                    "{recipe.notes.substring(0, 50)}{recipe.notes.length > 50 ? '...' : ''}"
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Ingredients
                  </h4>
                  <ul className="space-y-1">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="text-emerald-500 mr-2">•</span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Instructions
                  </h4>
                  <ol className="space-y-2">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 mr-2 min-w-[1.5rem]">
                          {index + 1}.
                        </span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Notes Dialog */}
      {notesDialogRecipe && (
        <RecipeNotesDialog
          recipe={notesDialogRecipe}
          open={!!notesDialogRecipe}
          onOpenChange={(open) => !open && setNotesDialogRecipe(null)}
          onUpdate={handleUpdateRecipe}
        />
      )}
    </div>
  )
}
