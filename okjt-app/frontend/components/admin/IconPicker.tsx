"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface IconPickerProps {
  selectedIcon: string
  onSelect: (iconName: string) => void
  icons: Record<string, React.ElementType>
  className?: string
}

export function IconPicker({ selectedIcon, onSelect, icons, className }: IconPickerProps) {
  return (
    <div className={cn("grid grid-cols-5 gap-2", className)}>
      {Object.keys(icons).map((iconName) => {
        const IconComponent = icons[iconName]
        return (
          <button
            key={iconName}
            type="button"
            onClick={() => onSelect(iconName)}
            className={cn(
              "h-10 w-10 p-0 rounded-lg border-2 transition-all",
              selectedIcon === iconName
                ? "border-primary bg-primary/10 ring-1 ring-primary"
                : "border-transparent hover:border-primary/30 hover:bg-primary/5"
            )}
          >
            <IconComponent size={18} className={cn(selectedIcon === iconName ? "text-primary" : "text-muted-foreground")} />
          </button>
        )
      })}
    </div>
  )
}