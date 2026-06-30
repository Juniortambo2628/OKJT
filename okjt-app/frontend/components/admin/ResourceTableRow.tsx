"use client"

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResourceTableRowProps<T extends { id: number }> {
  item: T
  selectedIds: number[]
  onToggleSelect: (id: number) => void
  onEdit: (item: T) => void
  onDelete: (id: number) => void
  children: React.ReactNode
  className?: string
}

export function ResourceTableRow<T extends { id: number }>({
  item,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
  children,
  className,
}: ResourceTableRowProps<T>) {
  const isSelected = selectedIds.includes(item.id)

  return (
    <tr key={item.id} className={cn("hover:bg-primary/5 transition-colors group", className)}>
      <td className="p-4 px-6">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(item.id)}
          className="border-border"
        />
      </td>
      {children}
      <td className="p-4 text-right pr-6">
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
          >
            <Pencil size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-destructive/40 hover:text-destructive" 
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </td>
    </tr>
  )
}