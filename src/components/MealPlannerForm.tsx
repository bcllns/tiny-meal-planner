import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Loader2 } from "lucide-react";

interface MealPlannerFormProps {
  onGenerateMeals: (numberOfPeople: number, mealType: string, notes: string) => void;
  isLoading: boolean;
}

export function MealPlannerForm({ onGenerateMeals, isLoading }: MealPlannerFormProps) {
  const [numberOfPeople, setNumberOfPeople] = useState<string>("4");
  const [mealType, setMealType] = useState<string>("all");
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(numberOfPeople);
    if (num > 0 && num <= 50) {
      onGenerateMeals(num, mealType, notes);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Utensils className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-3xl">Meal Planner</CardTitle>
        <CardDescription className="text-base">
          Generate personalized meal ideas and recipes based on the number of people you're cooking for, meal type, and any dietary preferences or restrictions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="numberOfPeople" className="text-sm font-medium">
              Number of People
            </label>
            <Input
              id="numberOfPeople"
              type="number"
              min="1"
              max="10"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(e.target.value)}
              placeholder="Enter number of people"
              className="text-lg"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter a number between 1 and 10
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="mealType" className="text-sm font-medium">
              Meal Type
            </label>
            <Select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              disabled={isLoading}
            >
              {/* <option value="all">All Meals (Breakfast, Lunch, Dinner)</option> */}
              <option value="breakfast">Breakfast </option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select which meal you want to plan
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Additional Notes (Optional)
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., only include vegetarian options, no nuts, low-carb meals..."
              disabled={isLoading}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Add any dietary restrictions or preferences
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full text-lg h-12" 
            disabled={isLoading || !numberOfPeople || parseInt(numberOfPeople) < 1}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Meal Plan...
              </>
            ) : (
              "Plan Meals"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
