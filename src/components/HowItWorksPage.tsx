import { ChefHat, Sparkles, ShoppingCart, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HowItWorksPageProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export function HowItWorksPage({ onBack, onGetStarted }: HowItWorksPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back to Home
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 mb-6 shadow-lg">
            <ChefHat className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">How It Works</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Plan your meals in four simple steps</p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">Step 1: Tell Us Your Preferences</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Start by telling us how many people you're cooking for and what type of meals you'd like. Add any dietary restrictions, preferences, or ingredients you'd like to use. Our AI will use this information to create personalized
                meal suggestions just for you.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">Step 2: Get AI-Powered Suggestions</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Our advanced AI analyzes your preferences and generates customized meal plans with breakfast, lunch, and dinner options. Each recipe includes detailed ingredients, step-by-step instructions, prep time, and serving
                information. Browse through the suggestions and find meals that look delicious to you.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <BookmarkCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">Step 3: Save Your Favorites</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Found a recipe you love? Save it to your personal collection with just one click. Add notes, ratings, and customize the recipes to make them your own. Build your perfect recipe library over time and access your favorites
                whenever you need them.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">Step 4: Generate Shopping Lists</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Add recipes to your shopping list and let our smart system consolidate all the ingredients for you. No more duplicate items or forgotten ingredients! Print your list or access it on your phone while shopping. It's meal
                planning made simple.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-12 text-center shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-emerald-50 text-lg mb-8">Join thousands of users who are simplifying their meal planning</p>
          <Button onClick={onGetStarted} size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
            Create Free Account
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About Section */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">About Tiny Meal Planner</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered meal planning application that helps you create delicious meals for any number of people.</p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <button onClick={onBack} className="hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Connect With Us</h3>
              <div className="flex gap-4">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors" aria-label="Instagram">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors" aria-label="TikTok">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Made with 😊 in WLV by Tiny Dev Co.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
