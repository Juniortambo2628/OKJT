"use client" // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global Application Error:", error)
  }, [error])

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-md w-full bg-secondary/10 border border-border/50 rounded-2xl p-8 flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
          <AlertTriangle size={32} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            A critical error occurred while rendering this page.
          </p>
        </div>

        <div className="bg-black/50 border border-red-500/20 w-full p-4 rounded-lg text-left overflow-hidden">
          <p className="text-xs font-mono text-red-400 break-words line-clamp-3">
            {error.message || "Unknown rendering error"}
          </p>
        </div>

        <Button 
          onClick={() => reset()}
          className="w-full bg-primary text-black hover:bg-primary/90 font-bold"
        >
          Try again
        </Button>
      </div>
    </div>
  )
}
