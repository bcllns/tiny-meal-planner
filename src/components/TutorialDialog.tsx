import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChefHat, Sparkles, BookmarkCheck, ShoppingCart } from "lucide-react";

interface TutorialDialogProps {
  open: boolean;
  onClose: () => void;
}

export function TutorialDialog({ open, onClose }: TutorialDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Welcome to Tiny Meal Planner!</DialogTitle>
          </div>
          <DialogDescription className="text-base">Let's get you started with planning delicious meals in seconds.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* How it works steps */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">1. Share Your Preferences</h3>
                <p className="text-sm text-muted-foreground">Tell us your dietary preferences, cuisine styles, and any ingredients you want to use or avoid.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ChefHat className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">2. Get AI-Powered Suggestions</h3>
                <p className="text-sm text-muted-foreground">Our AI instantly creates personalized meal plans with recipes tailored just for you.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">3. Save Your Favorites</h3>
                <p className="text-sm text-muted-foreground">Found a recipe you love? Save it to your collection for easy access anytime.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">4. Create Shopping Lists</h3>
                <p className="text-sm text-muted-foreground">Automatically generate consolidated shopping lists from your meal plans and saved recipes.</p>
              </div>
            </div>
          </div>

          {/* Trial information */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-6">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Free Trial:</span> You get <span className="font-bold text-primary">7 days free</span> to try out Tiny Meal Planner. After that, a subscription is required to continue creating new meal plans.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
