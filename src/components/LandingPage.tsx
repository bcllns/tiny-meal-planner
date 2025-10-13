import { ChefHat, Sparkles, ShoppingCart, BookmarkCheck, Star, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 mb-8 shadow-lg">
            <ChefHat className="h-10 w-10 text-white" />
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            AI-Powered Meal Planning
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Plan your week, save recipes, and generate smart shopping lists with the power of AI
          </p>
          
          {/* CTA Button */}
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Free
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            Everything You Need to Plan Delicious Meals
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                AI-Powered Meal Planning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get personalized meal suggestions for breakfast, lunch, and dinner based on your preferences and dietary needs
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Smart Shopping Lists
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically consolidate ingredients from multiple recipes into one organized shopping list
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <BookmarkCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Save Your Favorites
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Build your personal recipe collection and access your favorite meals anytime
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Rate & Review
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Add personal notes and ratings to your recipes to remember what worked best
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Prep & Cook Times
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                See exactly how much time each recipe will take with detailed prep and cook time information
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <ChefHat className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Detailed Instructions
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Follow step-by-step instructions with complete ingredient lists for every recipe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-12 text-center shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Meal Planning?
          </h2>
          <p className="text-emerald-50 text-lg mb-8">
            Start creating delicious, personalized meal plans in seconds
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p>Made with 😊 in WLV by Tiny Dev Co.</p>
      </div>
    </div>
  )
}
