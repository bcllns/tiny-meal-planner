import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface RecipeContextType {
  refreshTrigger: number
  triggerRefresh: () => void
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined)

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <RecipeContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </RecipeContext.Provider>
  )
}

export function useRecipeContext() {
  const context = useContext(RecipeContext)
  if (context === undefined) {
    throw new Error('useRecipeContext must be used within a RecipeProvider')
  }
  return context
}
