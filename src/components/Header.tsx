import { User, ChefHat, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
  activeTab?: 'dashboard' | 'recipes' | 'shopping';
  onTabChange?: (tab: 'dashboard' | 'recipes' | 'shopping') => void;
}

export function Header({ userName, userEmail, onSignOut, activeTab = 'dashboard', onTabChange }: HeaderProps) {
  return (
    <header className="border-b bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and App Name */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-10 h-10 rounded-lg flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Meal Planner</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Meal Planning</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            {onTabChange && (
              <nav className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => onTabChange('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onTabChange('recipes')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'recipes'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  My Recipes
                </button>
                <button
                  onClick={() => onTabChange('shopping')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'shopping'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Shopping List
                </button>
              </nav>
            )}
          </div>

          {/* User Account Section */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{userName || "Guest User"}</p>
              <p className="text-xs text-muted-foreground">{userEmail || "Free Plan"}</p>
            </div>
            {onSignOut ? (
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
                onClick={onSignOut}
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="outline" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
