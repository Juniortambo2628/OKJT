"use client"

import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HorizontalCarouselProps {
    children: React.ReactNode
    className?: string
}

export default function HorizontalCarousel({ children, className }: HorizontalCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const scrollAmount = 340
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        })
    }

    return (
        <div className={cn("relative group/carousel", className)}>
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none" />

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 pt-2 px-1 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {children}
            </div>

            <button
                onClick={() => scroll('left')}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-white/20"
                aria-label="Scroll left"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <button
                onClick={() => scroll('right')}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-white/20"
                aria-label="Scroll right"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    )
}
