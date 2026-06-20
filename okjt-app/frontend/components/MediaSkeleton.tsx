"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonBlockProps {
    className?: string
}

export const SkeletonBlock = ({ className }: SkeletonBlockProps) => (
    <div
        aria-hidden="true"
        className={cn(
            "relative overflow-hidden bg-secondary/20",
            "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite]",
            "before:bg-gradient-to-r before:from-transparent before:via-foreground/10 before:to-transparent",
            className
        )}
    />
)

interface SkeletonTextProps {
    lines?: number
    className?: string
}

export const SkeletonText = ({ lines = 3, className }: SkeletonTextProps) => (
    <div className={cn("space-y-3", className)} aria-hidden="true">
        {Array.from({ length: lines }).map((_, index) => (
            <SkeletonBlock
                key={index}
                className={cn(
                    "h-4 rounded-full",
                    index === lines - 1 ? "w-2/3" : "w-full"
                )}
            />
        ))}
    </div>
)

export const HeroSkeleton = ({ className }: SkeletonBlockProps) => (
    <div className={cn("absolute inset-0 z-0", className)} aria-hidden="true">
        <SkeletonBlock className="h-full w-full opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </div>
)

export const SectionSkeleton = ({ className }: SkeletonBlockProps) => (
    <section className={cn("w-full py-24 bg-background", className)} aria-busy="true">
        <div className="max-w-[1400px] mx-auto px-6">
            <div className="mb-12 max-w-3xl">
                <SkeletonBlock className="h-4 w-36 rounded-full mb-5" />
                <SkeletonBlock className="h-10 md:h-14 w-full max-w-2xl rounded-md mb-6" />
                <SkeletonText lines={2} className="max-w-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border border-border/50 bg-card/50 p-6">
                        <SkeletonBlock className="h-48 w-full mb-6" />
                        <SkeletonBlock className="h-5 w-3/4 rounded-full mb-4" />
                        <SkeletonText lines={3} />
                    </div>
                ))}
            </div>
        </div>
    </section>
)

const MediaSkeleton = SkeletonBlock

export default MediaSkeleton
