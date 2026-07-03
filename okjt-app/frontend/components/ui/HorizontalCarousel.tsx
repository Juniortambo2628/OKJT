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
        const containerWidth = scrollRef.current.clientWidth
        const scrollAmount = containerWidth * 0.85
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        })
    }

    const items = React.Children.toArray(children)

    return (
        <div className={cn("relative group/carousel h-full w-full", className)}>
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none" />

            <div
                ref={scrollRef}
                className="flex gap-4 h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide py-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((child, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 snap-start h-full w-[calc(33.333%-0.667rem)] min-w-[280px]"
                    >
                        {child}
                    </div>
                ))}
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
