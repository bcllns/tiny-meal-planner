import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LandingPage } from "@/components/LandingPage";
import { SignInPage } from "@/components/SignInPage";
import { SignUpPage } from "@/components/SignUpPage";
import { ResetPasswordPage } from "@/components/ResetPasswordPage";
import { HowItWorksPage } from "@/components/HowItWorksPage";
import { PrivacyPolicyPage } from "@/components/PrivacyPolicyPage";
import { TermsOfServicePage } from "@/components/TermsOfServicePage";
import { MealPlannerForm } from "@/components/MealPlannerForm";
import { MealCard } from "@/components/MealCard";
import { MyRecipesView } from "@/components/MyRecipesView";
import { ShoppingListView } from "@/components/ShoppingListView";
import { PaymentModal } from "@/components/PaymentModal";
import { SharedRecipeView } from "@/components/SharedRecipeView";
import { SharedShoppingListView } from "@/components/SharedShoppingListView";
import { TutorialDialog } from "@/components/TutorialDialog";
import { RecipeProvider } from "@/contexts/RecipeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { generateMealPlan } from "@/lib/openai";
import { getCurrentUser, signOut, onAuthStateChange, getUserProfile, markTutorialAsShown } from "@/lib/auth";
import { getSavedRecipes } from "@/lib/recipes";
import { clearShoppingList } from "@/lib/shoppingList";
import { canGenerateMeals, incrementMealPlanCount, getTrialExpiryDate, isTrialExpired } from "@/lib/subscription";
import type { Meal } from "@/types/meal";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/user";
import { AlertCircle, RefreshCw, ChefHat, Sparkles, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type AuthView = "landing" | "signin" | "signup" | "dashboard" | "reset-password" | "how-it-works" | "privacy-policy" | "terms-of-service";
type DashboardTab = "dashboard" | "recipes" | "shopping";

function App() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AuthView>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentSuccessDialog, setShowPaymentSuccessDialog] = useState(false);
  const [showTutorialDialog, setShowTutorialDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [savedRecipeCount, setSavedRecipeCount] = useState(0);
  const [sharedRecipeId, setSharedRecipeId] = useState<string | null>(null);
  const [sharedShoppingListId, setSharedShoppingListId] = useState<string | null>(null);
  
  // Store last meal plan parameters for "Show Me More" functionality
  const [lastMealPlanParams, setLastMealPlanParams] = useState<{
    numberOfPeople: number;
    mealType: string;
    notes: string;
  } | null>(null);

  // Check for shared recipe link or shared shopping list FIRST (before auth check)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("share");
    const shoppingListId = params.get("shoppingList");

    if (shareId) {
      setSharedRecipeId(shareId);
      // Keep the URL parameter so it persists on refresh
    }

    if (shoppingListId) {
      setSharedShoppingListId(shoppingListId);
      // Keep the URL parameter so it persists on refresh
    }

    // Check for content pages by path
    const path = window.location.pathname;
    if (path === "/how-it-works") {
      setCurrentView("how-it-works");
    } else if (path === "/privacy-policy") {
      setCurrentView("privacy-policy");
    } else if (path === "/terms-of-service") {
      setCurrentView("terms-of-service");
    }

    // Check if this is a password recovery link
    // Supabase includes type=recovery in the URL hash fragment
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const isRecovery = hashParams.get("type") === "recovery";

    // Also check if path is /reset-password (our redirect URL)
    if (window.location.pathname === "/reset-password" || isRecovery) {
      setCurrentView("reset-password");
      // Don't clean up URL yet - Supabase needs the hash to establish the session
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkUser = async () => {
      // First check if this is a password recovery flow
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const isRecovery = hashParams.get("type") === "recovery";

      if (isRecovery || window.location.pathname === "/reset-password") {
        // Don't proceed with normal auth check - keep on reset-password view
        setIsCheckingAuth(false);
        return;
      }

      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        // Don't override if we're already on specific views
        const protectedViews: AuthView[] = ["reset-password", "how-it-works", "privacy-policy", "terms-of-service"];
        if (!protectedViews.includes(currentView)) {
          setCurrentView("dashboard");
        }
        // Fetch user profile
        const profile = await getUserProfile();
        setUserProfile(profile);

        // Show tutorial dialog if user hasn't seen it yet
        if (profile && !profile.tutorial_shown) {
          setShowTutorialDialog(true);
        }

        // Fetch saved recipe count
        const recipes = await getSavedRecipes();
        setSavedRecipeCount(recipes.length);
      }
      setIsCheckingAuth(false);
    };

    checkUser();

    // Listen for auth state changes
    const { unsubscribe } = onAuthStateChange(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        // Don't override if we're already on specific views
        const protectedViews: AuthView[] = ["reset-password", "how-it-works", "privacy-policy", "terms-of-service"];
        if (!protectedViews.includes(currentView)) {
          setCurrentView("dashboard");
        }
        // Fetch user profile when user signs in
        const profile = await getUserProfile();
        setUserProfile(profile);

        // Show tutorial dialog if user hasn't seen it yet
        if (profile && !profile.tutorial_shown) {
          setShowTutorialDialog(true);
        }

        // Fetch saved recipe count
        const recipes = await getSavedRecipes();
        setSavedRecipeCount(recipes.length);
      } else {
        // Only redirect to landing if user was on dashboard (i.e., they signed out)
        // Don't override if they're on signup, signin, or other public pages
        if (currentView === "dashboard") {
          setCurrentView("landing");
        }
        setMeals([]);
        setUserProfile(null);
        setSavedRecipeCount(0);
      }
    });

    return () => unsubscribe();
  }, [currentView]);

  // Check for payment success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success" && user) {
      // Show success dialog
      setShowPaymentSuccessDialog(true);

      // Clean up URL without reloading
      window.history.replaceState({}, "", window.location.pathname);

      // Refresh user profile to get updated subscription status
      const refreshProfile = async () => {
        const profile = await getUserProfile();
        setUserProfile(profile);
      };
      refreshProfile();
    }
  }, [user]);

  const handleSignOut = async () => {
    // Clear user-specific shopping list before signing out
    if (user?.id) {
      clearShoppingList(user.id);
    }

    await signOut();
    setUser(null);
    setUserProfile(null);
    setSavedRecipeCount(0);
    setCurrentView("landing");
    setMeals([]);
  };

  const handleTutorialClose = async () => {
    setShowTutorialDialog(false);
    // Mark tutorial as shown in the database
    if (user?.id) {
      await markTutorialAsShown();
      // Update local profile state
      if (userProfile) {
        setUserProfile({ ...userProfile, tutorial_shown: true });
      }
    }
  };

  const handleGenerateMeals = async (numberOfPeople: number, mealType: string, notes: string, keepExisting: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    // Only clear meals if we're not keeping existing ones
    if (!keepExisting) {
      setMeals([]);
    }

    try {
      const generatedMeals = await generateMealPlan(numberOfPeople, mealType, notes);
      
      // If keeping existing, append new meals; otherwise replace
      if (keepExisting) {
        setMeals(prevMeals => [...prevMeals, ...generatedMeals]);
      } else {
        setMeals(generatedMeals);
      }
      
      setShowFormModal(false); // Close modal after generating meals
      
      // Store the parameters for "Show Me More" functionality
      setLastMealPlanParams({ numberOfPeople, mealType, notes });

      // Increment meal plan count after successful generation
      if (user?.id && userProfile) {
        const { success, newCount } = await incrementMealPlanCount(user.id);
        if (success && newCount !== undefined) {
          // Check if trial has expired based on date
          const trialStartDate = userProfile.trial_start_date || new Date().toISOString();
          const trialExpired = isTrialExpired(trialStartDate);
          
          // Update local profile state
          setUserProfile({
            ...userProfile,
            meal_plans_generated: newCount,
            trial_used: trialExpired,
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate meal plan. Please try again.");
      console.error("Error generating meals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowMeMore = async () => {
    if (!lastMealPlanParams) return;
    
    // Check if user can generate meals before proceeding
    if (user?.id) {
      const { canGenerate, reason } = await canGenerateMeals(user.id);

      if (!canGenerate) {
        // Trial expired or no subscription - show payment modal
        setShowPaymentModal(true);
        setError(reason || "Subscription required");
        return;
      }
    }
    
    // Resubmit with the same parameters, keeping existing meals
    await handleGenerateMeals(
      lastMealPlanParams.numberOfPeople,
      lastMealPlanParams.mealType,
      lastMealPlanParams.notes,
      true // keepExisting = true
    );
  };

  const handlePlanMeals = async () => {
    // Check if user can generate meals BEFORE showing the form
    if (user?.id) {
      const { canGenerate, reason } = await canGenerateMeals(user.id);

      if (!canGenerate) {
        // Trial already used and no subscription - show payment modal
        setShowPaymentModal(true);
        setError(reason || "Subscription required");
        return;
      }
    }

    // User can generate meals - show the form
    setShowFormModal(true);
  };

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    // Don't clear meals when switching tabs - keep them persisted
  };

  const handleMealNotInterested = (mealId: string) => {
    // Remove the meal from the displayed list
    setMeals((prevMeals) => prevMeals.filter((meal) => meal.id !== mealId));
  };

  // Show shared shopping list view if shopping list share ID is present (before auth checks)
  if (sharedShoppingListId) {
    return <SharedShoppingListView shareId={sharedShoppingListId} />;
  }

  // Show shared recipe view if share ID is present (before auth checks)
  if (sharedRecipeId) {
    return (
      <RecipeProvider>
        <SharedRecipeView shareId={sharedRecipeId} onClose={() => setSharedRecipeId(null)} />
      </RecipeProvider>
    );
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ChefHat className="h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page
  if (currentView === "landing") {
    return (
      <LandingPage onGetStarted={() => setCurrentView("signup")} onHowItWorks={() => setCurrentView("how-it-works")} onPrivacyPolicy={() => setCurrentView("privacy-policy")} onTermsOfService={() => setCurrentView("terms-of-service")} />
    );
  }

  // Show how it works page
  if (currentView === "how-it-works") {
    return <HowItWorksPage onBack={() => setCurrentView("landing")} onGetStarted={() => setCurrentView("signup")} />;
  }

  // Show privacy policy page
  if (currentView === "privacy-policy") {
    return <PrivacyPolicyPage onBack={() => setCurrentView("landing")} />;
  }

  // Show terms of service page
  if (currentView === "terms-of-service") {
    return <TermsOfServicePage onBack={() => setCurrentView("landing")} />;
  }

  // Show sign in page
  if (currentView === "signin") {
    return <SignInPage onSignIn={() => setCurrentView("dashboard")} onSwitchToSignUp={() => setCurrentView("signup")} />;
  }

  // Show sign up page
  if (currentView === "signup") {
    return <SignUpPage onSignUp={() => setCurrentView("dashboard")} onSwitchToSignIn={() => setCurrentView("signin")} />;
  }

  // Show reset password page
  if (currentView === "reset-password") {
    return <ResetPasswordPage onPasswordReset={() => setCurrentView("signin")} />;
  }

  // Show dashboard
  return (
    <RecipeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
        <Header userName={userProfile?.full_name} userEmail={userProfile?.email} onSignOut={handleSignOut} activeTab={activeTab} onTabChange={handleTabChange} />

        <main className="flex-1 py-12 px-4">
          <div className="container mx-auto max-w-7xl">
            {/* Tutorial Dialog */}
            <TutorialDialog open={showTutorialDialog} onClose={handleTutorialClose} />

            {/* Modal for meal planner form */}
            <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Plan Your Meals</DialogTitle>
                  <DialogDescription>Tell us how many people you're cooking for and any preferences you have.</DialogDescription>
                </DialogHeader>
                <MealPlannerForm onGenerateMeals={handleGenerateMeals} isLoading={isLoading} />
              </DialogContent>
            </Dialog>

            {/* Payment Modal */}
            {user && userProfile && <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} userEmail={userProfile.email} userId={user.id} isTrialUsed={userProfile.trial_used || false} />}

            {/* Payment Success Dialog */}
            <Dialog open={showPaymentSuccessDialog} onOpenChange={setShowPaymentSuccessDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-2xl">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <ChefHat className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Payment Successful!
                  </DialogTitle>
                  <DialogDescription className="text-base pt-4">Thank you for subscribing! You now have unlimited access to the Meal Planner.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium mb-2">✨ What's included:</p>
                    <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                      <li>• Unlimited meal planning</li>
                      <li>• AI-powered recipe suggestions</li>
                      <li>• Save unlimited recipes</li>
                      <li>• Smart shopping lists</li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => {
                      setShowPaymentSuccessDialog(false);
                      setShowFormModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                  >
                    Start Planning Meals
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <>
                {error && (
                  <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Error</h3>
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                {/* Show generated meals if they exist */}
                {meals.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-bold">Your Meal Plan</h2>
                      <Button onClick={handlePlanMeals} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Plan New Meals
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {meals.map((meal) => (
                        <MealCard key={meal.id} meal={meal} onNotInterested={handleMealNotInterested} />
                      ))}
                    </div>
                    
                    {/* Show Me More button */}
                    {lastMealPlanParams && (
                      <div className="flex justify-center mt-8">
                        <Button 
                          onClick={handleShowMeMore} 
                          disabled={isLoading}
                          variant="outline" 
                          size="lg"
                          className="gap-2 px-8"
                        >
                          <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                          {isLoading ? 'Generating...' : 'Show Me More'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Show centered Plan Meals button when no meals are displayed */}
                {!isLoading && meals.length === 0 && !error && (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                      <ChefHat className="h-10 w-10 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold mb-3">{savedRecipeCount === 0 ? "Welcome to Meal Planner!" : "Ready to Plan Your Meals?"}</h2>

                    <p className="text-muted-foreground mb-8 max-w-md">
                      {savedRecipeCount === 0
                        ? "You don't have any saved meals. Click Plan Meals to get started and discover delicious recipes!"
                        : "View your saved recipes by clicking on the My Recipes tab, or plan more meals by clicking the button below."}
                    </p>

                    <Button onClick={handlePlanMeals} size="lg" className="gap-2 text-lg px-8 py-6">
                      <ChefHat className="h-5 w-5" />
                      Plan Meals
                    </Button>

                    {/* Free trial indicator */}
                    {userProfile && !userProfile.subscription_status && userProfile.trial_start_date && (
                      <div className="mt-6 text-sm text-muted-foreground">
                        {!isTrialExpired(userProfile.trial_start_date) ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <Sparkles className="h-3.5 w-3.5" />
                            Free trial expires {getTrialExpiryDate(userProfile.trial_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* My Recipes Tab */}
            {activeTab === "recipes" && <MyRecipesView userId={user?.id} />}

            {/* Shopping List Tab */}
            {activeTab === "shopping" && <ShoppingListView userId={user?.id} />}
          </div>
        </main>

        <Footer onHowItWorks={() => (window.location.href = "/how-it-works")} onPrivacyPolicy={() => (window.location.href = "/privacy-policy")} onTermsOfService={() => (window.location.href = "/terms-of-service")} />
      </div>
    </RecipeProvider>
  );
}

export default App;
