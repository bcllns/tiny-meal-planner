import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { STRIPE_PAYMENT_LINK } from "@/lib/stripe";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: string;
  isTrialUsed: boolean;
}

export function PaymentModal({ isOpen, onClose, userEmail, userId, isTrialUsed }: PaymentModalProps) {
  const handleSubscribe = () => {
    // Build success redirect URL (back to dashboard)
    const successUrl = `${window.location.origin}?payment=success`;

    // Redirect directly to Stripe Payment Link with:
    // - prefilled_email: Pre-fill customer email
    // - client_reference_id: User ID for webhook processing
    // - success_url: Redirect back to dashboard after payment
    const paymentUrl = `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(userEmail)}&client_reference_id=${encodeURIComponent(userId)}&success_url=${encodeURIComponent(successUrl)}`;

    window.location.href = paymentUrl;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            Subscribe to Meal Planner
          </DialogTitle>
          <DialogDescription>{isTrialUsed ? "You've used your 2 free meal plans. Subscribe to continue planning delicious meals!" : "Subscribe now to unlock unlimited meal planning"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Subscription Details */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                $24.00<span className="text-lg font-normal text-muted-foreground">/year</span>
              </div>
              <p className="text-sm text-muted-foreground">One-time annual payment</p>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">What you'll get:</h4>
            <ul className="space-y-2">
              {["Unlimited AI-powered meal planning", "Smart shopping list generation", "Save unlimited favorite recipes", "Rate and review your meals", "Detailed cooking instructions", "Print recipes and shopping lists"].map(
                (feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button onClick={handleSubscribe} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600">
              <CreditCard className="mr-2 h-4 w-4" />
              Subscribe Now
            </Button>
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
