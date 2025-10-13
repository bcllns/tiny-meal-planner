import { useEffect, useState } from 'react'
import { 
  getShoppingList, 
  clearShoppingList, 
  getCachedConsolidatedList,
  setCachedConsolidatedList,
  hasShoppingListChanged,
  type ShoppingListItem 
} from '@/lib/shoppingList'
import { consolidateIngredients, type ConsolidatedIngredient } from '@/lib/consolidateIngredients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2, Loader2, AlertCircle, Printer } from 'lucide-react'

export function ShoppingListView() {
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [consolidatedList, setConsolidatedList] = useState<ConsolidatedIngredient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConsolidating, setIsConsolidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usingCache, setUsingCache] = useState(false)

  useEffect(() => {
    loadShoppingList()
  }, [])

  const loadShoppingList = async () => {
    setIsLoading(true)
    setError(null)
    setUsingCache(false)
    
    const list = getShoppingList()
    setItems(list)

    if (list.length > 0) {
      // Check if we have a valid cached consolidated list
      const needsConsolidation = hasShoppingListChanged()
      
      if (!needsConsolidation) {
        // Use cached list
        const cache = getCachedConsolidatedList()
        if (cache && cache.consolidated) {
          setConsolidatedList(cache.consolidated)
          setUsingCache(true)
          setIsLoading(false)
          return
        }
      }

      // Need to consolidate with OpenAI
      setIsConsolidating(true)
      try {
        const consolidated = await consolidateIngredients(list)
        setConsolidatedList(consolidated)
        
        // Cache the result
        const recipeIds = list.map(item => item.recipeId)
        setCachedConsolidatedList(recipeIds, consolidated)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to consolidate ingredients')
      } finally {
        setIsConsolidating(false)
      }
    } else {
      setConsolidatedList([])
    }

    setIsLoading(false)
  }

  const handleClearList = () => {
    if (window.confirm('Are you sure you want to clear your entire shopping list?')) {
      clearShoppingList()
      setItems([])
      setConsolidatedList([])
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shopping List</title>
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
            .subtitle {
              color: #6b7280;
              margin-bottom: 30px;
              font-size: 14px;
            }
            .ingredients-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              margin-bottom: 40px;
            }
            .ingredient-item {
              display: flex;
              align-items: start;
              gap: 12px;
              padding: 12px;
              background: #f9fafb;
              border-radius: 8px;
              break-inside: avoid;
            }
            .ingredient-number {
              flex-shrink: 0;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: #d1fae5;
              color: #065f46;
              font-weight: 600;
              font-size: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .ingredient-content {
              flex: 1;
              min-width: 0;
            }
            .ingredient-name {
              font-weight: 500;
              color: #111827;
              word-wrap: break-word;
            }
            .ingredient-notes {
              font-size: 11px;
              color: #6b7280;
              margin-top: 4px;
            }
            .recipes-section {
              border-top: 2px solid #e5e7eb;
              padding-top: 20px;
            }
            .recipes-section h2 {
              color: #059669;
              font-size: 18px;
              margin-bottom: 15px;
            }
            .recipe-item {
              margin-bottom: 12px;
              padding: 10px;
              background: #f9fafb;
              border-radius: 6px;
            }
            .recipe-name {
              font-weight: 600;
              color: #111827;
            }
            .recipe-servings {
              font-size: 12px;
              color: #6b7280;
            }
            @media print {
              body { padding: 0; }
              .ingredients-grid {
                gap: 8px;
              }
            }
          </style>
        </head>
        <body>
          <h1>Shopping List</h1>
          <div class="subtitle">${items.length} recipe${items.length !== 1 ? 's' : ''} • ${consolidatedList.length} ingredient${consolidatedList.length !== 1 ? 's' : ''}</div>
          
          <div class="ingredients-grid">
            ${consolidatedList.map((item, index) => `
              <div class="ingredient-item">
                <div class="ingredient-number">${index + 1}</div>
                <div class="ingredient-content">
                  <div class="ingredient-name">${item.quantity} ${item.ingredient}</div>
                  ${item.notes ? `<div class="ingredient-notes">${item.notes}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="recipes-section">
            <h2>Recipes</h2>
            ${items.map(item => `
              <div class="recipe-item">
                <div class="recipe-name">${item.recipeName}</div>
                <div class="recipe-servings">${item.servings} servings</div>
              </div>
            `).join('')}
          </div>
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 mb-4">
          <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
        </div>
        <p className="text-muted-foreground">Loading your shopping list...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Shopping List is Empty</h2>
        <p className="text-muted-foreground mb-6">
          Go to My Recipes and click the list icon on any recipe to add ingredients to your shopping list.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Shopping List</h2>
          <p className="text-muted-foreground">
            {items.length} recipe{items.length !== 1 ? 's' : ''} • 
            {usingCache ? ' Cached list' : ' AI-consolidated ingredients'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="gap-2"
            disabled={consolidatedList.length === 0}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={handleClearList}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear List
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consolidated Shopping List */}
        <Card className="lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Consolidated Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isConsolidating ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">AI is consolidating your ingredients...</p>
              </div>
            ) : consolidatedList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consolidatedList.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {item.quantity} {item.ingredient}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setConsolidatedList(consolidatedList.filter((_, i) => i !== index))
                      }}
                      className="flex-shrink-0 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No ingredients to display</p>
            )}
          </CardContent>
        </Card>

        {/* Recipes in Shopping List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recipes in This List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.recipeId} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{item.recipeName}</h4>
                      <p className="text-sm text-muted-foreground">{item.servings} servings</p>
                    </div>
                  </div>
                  <details className="mt-2">
                    <summary className="text-sm text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline">
                      View ingredients ({item.ingredients.length})
                    </summary>
                    <ul className="mt-2 space-y-1 pl-4">
                      {item.ingredients.map((ing, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          • {ing}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
