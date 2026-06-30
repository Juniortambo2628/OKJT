"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  isActive: boolean
  activeLabel?: string
  inactiveLabel?: string
  variant?: 'default' | 'featured' | 'published'
  className?: string
}

export function StatusBadge({ 
  isActive, 
  activeLabel = 'Active', 
  inactiveLabel = 'Inactive',
  variant = 'default',
  className 
}: StatusBadgeProps) {
  const config = {
    default: {
      active: 'text-emerald-500',
      inactive: 'text-amber-500',
    },
    featured: {
      active: 'text-emerald-500',
      inactive: 'text-muted-foreground',
    },
    published: {
      active: 'text-emerald-500',
      inactive: 'text-amber-500',
    },
  }

  const colors = config[variant]
  const label = isActive ? activeLabel : inactiveLabel
  const color = isActive ? colors.active : colors.inactive

  return (
    <span className={cn(
      "text-[10px] font-bold uppercase tracking-wider",
      color,
      className
    )}>
      {label}
    </span>
  )
}