import { useEffect, useState } from "react";
import { getSharedShoppingList } from "@/lib/shoppingList";
import { type ConsolidatedIngredient } from "@/lib/consolidateIngredients";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface SharedShoppingListViewProps {
  shareId: string;
}

export function SharedShoppingListView({ shareId }: SharedShoppingListViewProps) {
  const [consolidatedList, setConsolidatedList] = useState<ConsolidatedIngredient[]>([]);
  //const [sharedBy, setSharedBy] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedList = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getSharedShoppingList(shareId);
        if (result) {
          setConsolidatedList(result.consolidatedIngredients);
          //setSharedBy(result.sharedBy);
        } else {
          setError("Shopping list not found or has been deleted");
        }
      } catch {
        setError("Failed to load shopping list");
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedList();
  }, [shareId]);

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shared Shopping List</title>
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
            @media print {
              body { padding: 0; }
              .ingredients-grid {
                gap: 8px;
              }
            }
          </style>
        </head>
        <body>
          <h1>Shared Shopping List</h1>
          <div class="subtitle">${consolidatedList.length} ingredient${consolidatedList.length !== 1 ? "s" : ""}</div>
          
          <div class="ingredients-grid">
            ${consolidatedList
              .map(
                (item, index) => `
              <div class="ingredient-item">
                <div class="ingredient-number">${index + 1}</div>
                <div class="ingredient-content">
                  <div class="ingredient-name">${item.quantity} ${item.ingredient}</div>
                  ${item.notes ? `<div class="ingredient-notes">${item.notes}</div>` : ""}
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Header showGetStarted={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading shopping list...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Header showGetStarted={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Shopping List</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => (window.location.href = "/")} className="w-full">
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (consolidatedList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Header showGetStarted={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-2">This Shopping List is Empty</h2>
            <p className="text-muted-foreground mb-6">The shared shopping list doesn't contain any ingredients.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header showGetStarted={true} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Shared Shopping List</h2>
          <p className="text-muted-foreground">Shared by {sharedBy}</p>
        </div> */}

        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl">🛒 Shopping List</CardTitle>
                <CardDescription className="text-base mt-2">
                  {consolidatedList.length} ingredient{consolidatedList.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <button onClick={handlePrint} className="ml-4 p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors flex-shrink-0" title="Print shopping list">
                <Printer className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {consolidatedList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consolidatedList.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-semibold text-sm">{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground break-words">
                        {item.quantity} {item.ingredient}
                      </div>
                      {item.notes && <div className="text-xs text-muted-foreground mt-1">{item.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No ingredients to display</p>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg border border-emerald-100 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            This shopping list was shared with you. Want to create your own meal plans?{" "}
            <a href="/" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
              Get started free
            </a>
          </p>
        </div>
      </main>

      <Footer onHowItWorks={() => (window.location.href = "/how-it-works")} onPrivacyPolicy={() => (window.location.href = "/privacy-policy")} onTermsOfService={() => (window.location.href = "/terms-of-service")} />
    </div>
  );
}
