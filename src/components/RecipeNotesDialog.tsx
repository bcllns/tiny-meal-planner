import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2 } from 'lucide-react'
import { updateRecipeNotesAndRating } from '@/lib/recipes'
import type { SavedRecipe } from '@/lib/recipes'

interface RecipeNotesDialogProps {
  recipe: SavedRecipe
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function RecipeNotesDialog({ recipe, open, onOpenChange, onUpdate }: RecipeNotesDialogProps) {
  const [notes, setNotes] = useState(recipe.notes || '')
  const [rating, setRating] = useState<number | null>(recipe.rating)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    const result = await updateRecipeNotesAndRating(
      recipe.id,
      notes.trim() || null,
      rating
    )

    if (result.success) {
      onUpdate() // Trigger refresh of recipes
      onOpenChange(false) // Close dialog
    } else {
      setError(result.error || 'Failed to save notes and rating')
    }

    setIsSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Notes & Rating</DialogTitle>
          <DialogDescription>
            Add your thoughts and rate this recipe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Section */}
          <div>
            <label className="text-sm font-medium mb-3 block">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
              {rating && (
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="ml-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
            {rating && (
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Notes Section */}
          <div>
            <label htmlFor="notes" className="text-sm font-medium mb-2 block">
              Notes
            </label>
            <Textarea
              id="notes"
              placeholder="Add your notes about this recipe... (e.g., modifications, tips, or comments)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {notes.length} characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
