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
                "relative h-full w-full rounded-3xl overflow-hidden p-6 sm:p-8 flex flex-col transition-all duration-500 group",
                "border border-white/10",
                className
            )}
        >
            {/* Background */}
            {hasImage ? (
                <>
                    <img
                        src={image}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
                </>
            ) : (
                <>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-primary/5" />
                    <div className="absolute inset-0 backdrop-blur-2xl" />
                </>
            )}

            {/* Header: title + arrow */}
            <div className="relative z-10 flex items-start justify-between gap-4 mb-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <div className="flex-shrink-0 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                    <ArrowUpRight className="h-4 w-4 text-white group-hover:text-[#14110b] transition-colors" />
                </div>
            </div>

            {/* Description */}
            <div className="relative z-10 mt-auto">
                {description && (
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-4">
                        {description}
                    </p>
                )}
                {children}
            </div>
        </div>
    )

    if (href) {
        return (
            <Link href={href} className="block h-full w-full flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-3xl">
                {content}
            </Link>
        )
    }

    return content
}
