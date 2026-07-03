"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CarouselCardProps {
    title: string
    description?: string
    image?: string | null
    href?: string
    className?: string
    children?: React.ReactNode
}

export default function CarouselCard({
    title,
    description,
    image,
    href,
    className,
    children
}: CarouselCardProps) {
    const hasImage = !!image

    const content = (
        <div
            className={cn(
                "relative h-full min-h-[320px] w-[280px] sm:w-[320px] flex-shrink-0 rounded-3xl overflow-hidden p-6 flex flex-col justify-between group transition-all duration-500",
                "border border-white/10",
                hasImage
                    ? ""
                    : "bg-white/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/5",
                className
            )}
        >
            {hasImage && (
                <>
                    <img
                        src={image}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
                </>
            )}

            {/* Frosted overlay for no image */}
            {!hasImage && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-primary/5" />
                    <div className="absolute inset-0 backdrop-blur-2xl" />
                </>
            )}

            {/* Arrow */}
            <div className="relative z-10 self-end w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                <ArrowUpRight className="h-4 w-4 text-white group-hover:text-[#14110b] transition-colors" />
            </div>

            {/* Text */}
            <div className="relative z-10 mt-auto">
                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3 group-hover:text-primary transition-colors">
                    {title}
                </h3>
                {description && (
                    <p className="text-white/60 text-sm leading-relaxed line-clamp-3">
                        {description}
                    </p>
                )}
                {children}
            </div>
        </div>
    )

    if (href) {
        return (
            <Link href={href} className="block flex-shrink-0">
                {content}
            </Link>
        )
    }

    return content
}
