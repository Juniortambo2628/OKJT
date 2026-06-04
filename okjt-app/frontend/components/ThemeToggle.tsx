"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils" // Assuming cn utility is available here

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
      return <div className="w-[34px] h-[34px] rounded-full border border-border opacity-0"></div>
  }

  return (
    <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="relative p-2 rounded-full border border-border hover:bg-secondary/80 transition-all duration-300 group overflow-hidden"
        aria-label="Toggle theme"
    >
        <div className="relative z-10">
            {theme === "dark" ? (
                <Sun size={18} className="text-yellow-400 group-hover:rotate-45 transition-transform duration-500" />
            ) : (
                <Moon size={18} className="text-foreground group-hover:-rotate-12 transition-transform duration-500" />
            )}
        </div>
        
        {/* Ambient Background Glow */}
        <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            theme === 'dark' ? "bg-yellow-400/10" : "bg-primary/5"
        )} />
    </button>
  )
}
