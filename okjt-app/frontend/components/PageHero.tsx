"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Breadcrumbs from './Breadcrumbs'
import Image from 'next/image'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface PageHeroProps {
    tagline?: string
    title: string
    subtitle?: string
    breadcrumbs?: BreadcrumbItem[]
    bgImage?: string
    videoSrc?: string
    className?: string
    centered?: boolean
    children?: React.ReactNode
}

const PageHero = ({ 
    tagline, 
    title, 
    subtitle, 
    breadcrumbs, 
    bgImage, 
    videoSrc, 
    className,
    centered = false,
    children
}: PageHeroProps) => {
    return (
        <section className={cn(
            "relative pt-40 pb-20 bg-background overflow-hidden border-b border-border/50 min-h-[50vh] flex flex-col justify-center",
            className
        )}>
            {/* Background Media */}
            {videoSrc ? (
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-20"
                    >
                        <source src={videoSrc} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>
            ) : bgImage ? (
                <div className="absolute inset-0 z-0">
                    <Image 
                        src={bgImage} 
                        alt={title} 
                        fill 
                        priority
                        className="object-cover opacity-20" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
            )}

            <div className={cn(
                "max-w-[1200px] mx-auto px-6 relative z-10 w-full",
                centered && "text-center"
            )}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {breadcrumbs && (
                        <Breadcrumbs 
                            items={breadcrumbs} 
                            className={cn("mb-8", centered && "justify-center")} 
                        />
                    )}

                    {tagline && (
                        <span className="text-primary font-bold text-sm uppercase tracking-[0.3em] mb-4 block">
                            {tagline}
                        </span>
                    )}

                    <h1 className={cn(
                        "font-bold text-foreground leading-[1.1] tracking-tighter",
                        centered ? "text-5xl md:text-7xl lg:text-8xl" : "text-4xl md:text-6xl lg:text-7xl",
                        "mb-8"
                    )}>
                        <div dangerouslySetInnerHTML={{ __html: title }} />
                    </h1>

                    {subtitle && (
                        <p className={cn(
                            "text-muted-foreground leading-relaxed max-w-2xl",
                            centered ? "mx-auto text-xl" : "text-lg",
                            "opacity-80"
                        )}>
                            {subtitle}
                        </p>
                    )}

                    {children}
                </motion.div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </section>
    )
}

export default PageHero
