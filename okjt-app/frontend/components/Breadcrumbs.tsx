"use client"

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
    className?: string
}

const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
    return (
        <nav 
            aria-label="Breadcrumb" 
            className={cn("flex items-center gap-2 text-xs font-medium py-4", className)}
        >
            <Link 
                href="/" 
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
            >
                <Home size={14} />
                <span className="hidden sm:inline">Home</span>
            </Link>

            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight size={12} className="text-muted-foreground/30 shrink-0" />
                    {item.href ? (
                        <Link 
                            href={item.href} 
                            className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-primary font-bold truncate max-w-[200px]">
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    )
}

export default Breadcrumbs
