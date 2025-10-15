import { useEffect, useState, useRef } from "react";
import { getSharedRecipe } from "@/lib/shareRecipe";
import type { Meal } from "@/types/meal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface SharedRecipeViewProps {
  shareId: string;
  onClose: () => void;
}

export function SharedRecipeView({ shareId, onClose }: SharedRecipeViewProps) {
  const [recipe, setRecipe] = useState<Meal | null>(null);
  const [sharedBy, setSharedBy] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSharedRecipe = async () => {
      const result = await getSharedRecipe(shareId);

      if (result.success && result.recipe) {
        // Convert SharedRecipe to Meal format
        const sharedRecipe = result.recipe;
        const meal: Meal = {
          id: sharedRecipe.share_id,
          name: sharedRecipe.name,
          description: sharedRecipe.description || "",
          servings: sharedRecipe.servings,
          prepTime: sharedRecipe.prep_time || "",
          cookTime: sharedRecipe.cook_time || "",
          ingredients: sharedRecipe.ingredients,
          instructions: sharedRecipe.instructions,
          category: sharedRecipe.category,
        };
        setRecipe(meal);
        setSharedBy(sharedRecipe.shared_by_name || "Someone");
      } else {
        setError(result.error || "Recipe not found");
      }

      setIsLoading(false);
    };

    fetchSharedRecipe();
  }, [shareId]);

  const handlePrint = () => {
    if (!recipe) return;

    const printWindow = window.open("", "", "width=800,height=600");
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
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${recipe.name}</h1>
          ${recipe.description ? `<div class="description">${recipe.description}</div>` : ""}
          <div class="meta">
            <div class="meta-item">
              <span>👥 ${recipe.servings} servings</span>
            </div>
            <div class="meta-item">
              <span>⏱️ Prep: ${recipe.prepTime}${recipe.cookTime ? ` / Cook: ${recipe.cookTime}` : ""}</span>
            </div>
          </div>
          <h2>Ingredients</h2>
          <ul>
            ${recipe.ingredients.map((ing) => `<li>${ing}</li>`).join("")}
          </ul>
          <h2>Instructions</h2>
          <ol>
            ${recipe.instructions.map((inst) => `<li>${inst}</li>`).join("")}
          </ol>
          <div class="footer">
            <p>Shared by ${sharedBy}</p>
            <p>Powered by Tiny Meal Planner</p>
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
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Header showGetStarted={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center mx-4">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Recipe Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "This shared recipe link is invalid or has expired."}</p>
            <Button onClick={onClose} className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600">
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header showGetStarted={true} />

      {/* Recipe Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Shared Recipe</h2>
          <p className="text-muted-foreground">Shared by {sharedBy}</p>
        </div> */}
        <Card ref={cardRef} className="overflow-hidden shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl">{recipe.name}</CardTitle>
                {recipe.description && <CardDescription className="text-base mt-2">{recipe.description}</CardDescription>}
              </div>
              <button onClick={handlePrint} className="ml-4 p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors flex-shrink-0" title="Print recipe">
                <Printer className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </button>
            </div>
            <div className="flex gap-6 mt-4 text-base">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>{recipe.servings} servings</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {recipe.prepTime}
                  {recipe.cookTime ? ` / ${recipe.cookTime}` : ""}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="space-y-8">
              {/* Ingredients */}
              <div>
                <h2 className="font-bold text-xl mb-4 text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Ingredients</h2>
                <ul className="space-y-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg p-6">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start text-base">
                      <span className="text-emerald-500 mr-3 text-lg">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h2 className="font-bold text-xl mb-4 text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Instructions</h2>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start text-base">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 mr-3 min-w-[2rem] text-lg">{index + 1}.</span>
                      <span className="leading-relaxed">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg border border-emerald-100 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            This recipe was shared with you. Want to create your own meal plans?{" "}
            <a href="/" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
              Get started free
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
