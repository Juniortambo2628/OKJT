"use client"

import React from 'react'
import { Grid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewMode = 'grid' | 'list'

interface ViewToggleProps {
    mode: ViewMode
    onChange: (mode: ViewMode) => void
    label?: string
}

const ViewToggle = ({ mode, onChange, label = 'View' }: ViewToggleProps) => {
    return (
        <div className="flex items-center gap-3">
            {label && (
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    {label}
                </span>
            )}
            <div className="flex bg-secondary/20 border border-border/50 rounded-lg p-1">
                <button
                    onClick={() => onChange('grid')}
                    className={cn(
                        "p-1.5 rounded-md transition-all",
                        mode === 'grid' 
                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                            : "text-muted-foreground/60 hover:text-foreground"
                    )}
                    aria-label="Grid View"
                    aria-pressed={mode === 'grid'}
                >
                    <Grid size={16} />
                </button>
                <button
                    onClick={() => onChange('list')}
                    className={cn(
                        "p-1.5 rounded-md transition-all",
                        mode === 'list' 
                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                            : "text-muted-foreground/60 hover:text-foreground"
                    )}
                    aria-label="List View"
                    aria-pressed={mode === 'list'}
                >
                    <List size={16} />
                </button>
            </div>
        </div>
    )
}

export default ViewToggle
