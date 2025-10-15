import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Meal } from "@/types/meal";
import { Clock, Users, Menu, Bookmark, BookmarkCheck, Loader2, Printer, ThumbsDown, Share2 } from "lucide-react";
import { saveRecipe, deleteRecipe, checkIfRecipeSaved } from "@/lib/recipes";
import { markAsNotInterested, removeFromNotInterested, checkIfNotInterested } from "@/lib/notInterested";
import { useRecipeContext } from "@/contexts/RecipeContext";
import { shareRecipe } from "@/lib/shareRecipe";
import { ShareDialog } from "@/components/ShareDialog";
import { supabase } from "@/lib/supabase";

interface MealCardProps {
  meal: Meal;
  onNotInterested?: (mealId: string) => void;
}

export function MealCard({ meal, onNotInterested }: MealCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isNotInterested, setIsNotInterested] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const { triggerRefresh } = useRecipeContext();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if recipe is already saved
    checkIfRecipeSaved(meal.id).then(setIsSaved);
    // Check if recipe is marked as not interested
    checkIfNotInterested(meal.id).then(setIsNotInterested);
  }, [meal.id]);

  const handleSaveRecipe = async () => {
    setIsPopoverOpen(false);
    setIsSaving(true);
    setSaveError(null);

    if (isSaved) {
      // Unsave the recipe
      const result = await deleteRecipe(meal.id);
      if (result.success) {
        setIsSaved(false);
        triggerRefresh(); // Notify SavedRecipes component
      } else {
        setSaveError(result.error || "Failed to remove recipe");
      }
    } else {
      // Save the recipe
      const result = await saveRecipe(meal);
      if (result.success) {
        setIsSaved(true);
        triggerRefresh(); // Notify SavedRecipes component
      } else {
        setSaveError(result.error || "Failed to save recipe");
      }
    }

    setIsSaving(false);
  };

  const handleNotInterested = async () => {
    setIsPopoverOpen(false);
    setIsSaving(true);
    setSaveError(null);

    if (isNotInterested) {
      // Remove from not interested
      const result = await removeFromNotInterested(meal.id);
      if (result.success) {
        setIsNotInterested(false);
      } else {
        setSaveError(result.error || "Failed to update preference");
      }
    } else {
      // Mark as not interested
      const result = await markAsNotInterested(meal.id, meal.name);
      if (result.success) {
        setIsNotInterested(true);
        // Notify parent component to remove this card from display
        if (onNotInterested) {
          onNotInterested(meal.id);
        }
      } else {
        setSaveError(result.error || "Failed to update preference");
      }
    }

    setIsSaving(false);
  };

  const handlePrint = () => {
    setIsPopoverOpen(false);

    // Create a print-friendly version of the card
    const printContent = cardRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${meal.name} - Recipe</title>
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
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${meal.name}</h1>
          <div class="description">${meal.description}</div>
          <div class="meta">
            <div class="meta-item">
              <span>👥 ${meal.servings} servings</span>
            </div>
            <div class="meta-item">
              <span>⏱️ Prep: ${meal.prepTime}${meal.cookTime ? ` / Cook: ${meal.cookTime}` : ""}</span>
            </div>
          </div>
          <h2>Ingredients</h2>
          <ul>
            ${meal.ingredients.map((ing) => `<li>${ing}</li>`).join("")}
          </ul>
          <h2>Instructions</h2>
          <ol>
            ${meal.instructions.map((inst) => `<li>${inst}</li>`).join("")}
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
  };

  const handleShare = async () => {
    setIsPopoverOpen(false);
    setIsShareDialogOpen(true);
    setIsGeneratingShare(true);
    setShareUrl(null);

    // Get user's name
    const {
      data: { user },
    } = await supabase!.auth.getUser();
    const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Anonymous";

    const result = await shareRecipe(meal, userName);

    setIsGeneratingShare(false);

    if (result.success && result.shareUrl) {
      setShareUrl(result.shareUrl);
    } else {
      // Error handled in dialog
      setShareUrl(null);
    }
  };

  return (
    <Card ref={cardRef} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isSaved && <BookmarkCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
              <CardTitle className="text-xl">{meal.name}</CardTitle>
            </div>
            <CardDescription className="text-sm">{meal.description}</CardDescription>
          </div>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="bg-white dark:bg-gray-800 rounded-full p-2 ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Menu className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="space-y-1">
                <button onClick={handleSaveRecipe} disabled={isSaving} className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md text-left disabled:opacity-50">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isSaved ? "Removing..." : "Saving..."}</span>
                    </>
                  ) : isSaved ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 text-emerald-600" />
                      <span>Remove from Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      <span>Save Recipe</span>
                    </>
                  )}
                </button>
                <button onClick={handleShare} className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md text-left">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
                <button onClick={handlePrint} className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md text-left">
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
                <button onClick={handleNotInterested} disabled={isSaving} className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md text-left disabled:opacity-50">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : isNotInterested ? (
                    <>
                      <ThumbsDown className="h-4 w-4 text-gray-600" />
                      <span>Remove Not Interested</span>
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="h-4 w-4" />
                      <span>Not Interested</span>
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
            <span>{meal.servings} servings</span>
          </div>
          <div className="flex items-center gap-1" title={`Prep time: ${meal.prepTime}${meal.cookTime ? ` / Cook time: ${meal.cookTime}` : ""}`}>
            <Clock className="h-4 w-4" />
            <span>
              {meal.prepTime}
              {meal.cookTime ? ` / ${meal.cookTime}` : ""}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400">Ingredients</h4>
            <ul className="space-y-1">
              {meal.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400">Instructions</h4>
            <ol className="space-y-2">
              {meal.instructions.map((instruction, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 mr-2 min-w-[1.5rem]">{index + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Error Message */}
        {saveError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-xs text-red-600 dark:text-red-400 text-center">{saveError}</p>
          </div>
        )}
      </CardContent>

      <ShareDialog isOpen={isShareDialogOpen} onClose={() => setIsShareDialogOpen(false)} shareUrl={shareUrl} isGenerating={isGeneratingShare} recipeName={meal.name} />
    </Card>
  );
}
