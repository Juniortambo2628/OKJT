"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: string[]
  activeCategory: string
  onCategoryChange: (category: string) => void
  className?: string
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  className,
}: CategoryFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={cn(
            'text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-all border',
            activeCategory === cat
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
              : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
