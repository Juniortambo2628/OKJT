"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonCardProps {
    variant?: 'grid' | 'list'
    count?: number
}

const SkeletonCard = ({ variant = 'grid', count = 3 }: SkeletonCardProps) => {
    return (
        <div className={cn(
            "grid gap-12",
            variant === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
        )}>
            {Array.from({ length: count }).map((_, i) => (
                <div 
                    key={i} 
                    className={cn(
                        "relative bg-secondary/10 border border-border/50 animate-pulse overflow-hidden",
                        variant === 'grid' ? "aspect-[16/10]" : "h-64 md:h-80 flex flex-col md:flex-row"
                    )}
                >
                    <div className={cn(
                        "bg-muted/20",
                        variant === 'grid' ? "absolute inset-0" : "h-full md:w-[45%] shrink-0"
                    )} />
                    <div className="flex-1 p-8 space-y-4">
                        <div className="h-4 w-24 bg-muted/20 rounded-full" />
                        <div className="h-8 w-64 bg-muted/20 rounded-lg" />
                        <div className="h-4 w-full bg-muted/10 rounded" />
                        <div className="h-4 w-3/4 bg-muted/10 rounded" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default SkeletonCard
