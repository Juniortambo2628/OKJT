"use client"

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResourceCardProps<T extends { id: number }> {
  item: T
  selectedIds: number[]
  onToggleSelect: (id: number) => void
  onEdit: (item: T) => void
  onDelete: (id: number) => void
  children: React.ReactNode
  className?: string
  checkboxPosition?: 'top-left' | 'top-right'
}

export function ResourceCard<T extends { id: number }>({
  item,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
  children,
  className,
  checkboxPosition = 'top-left',
}: ResourceCardProps<T>) {
  const isSelected = selectedIds.includes(item.id)

  return (
    <div
      key={item.id}
      className={cn(
        "group relative border border-border overflow-hidden hover:border-primary/40 transition-all flex flex-col shadow-sm",
        className
      )}
    >
      <div className={cn(
        "absolute top-4 z-10",
        checkboxPosition === 'top-left' ? 'left-4' : 'right-4'
      )}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(item.id)}
          className="border-border bg-background/50"
        />
      </div>
      
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground/40 bg-background/50 backdrop-blur-sm border border-border" 
            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
          >
            <Pencil size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive/40 bg-background/50 backdrop-blur-sm border border-border hover:text-destructive" 
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}