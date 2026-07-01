"use client"

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { SkeletonBlock } from '@/components/MediaSkeleton'
import { PARALLAX_DEFAULTS } from '@/lib/config'

interface ParallaxSectionProps {
    bgMedia?: string | null
    overlayOpacity?: number
    heightClass?: string
    badgeText?: string
    title?: string | React.ReactNode
    subtitle?: string | React.ReactNode
    id?: string
    children?: React.ReactNode
    index?: number
    contentMaxWidth?: string
}

/**
 * ParallaxSection — scroll-driven reveal with title→content crossfade.
 *
 * Animation sequence (when both title/subtitle AND children are present):
 *   0%–5%   : Title + badge slide in, become visible
 *   5%–12%  : Subtitle cascades in below the title
 *   12%–20% : Title & subtitle crossfade OUT while children crossfade IN
 *   20%–85% : Only children content is visible (full viewport space)
 *   85%–95% : Children fade out
 *   95%–100%: Dead zone for seamless transition to next section
 *
 * When there are NO children, the title/subtitle persist throughout
 * the section (legacy behavior for CTA-style sections).
 */
export default function ParallaxSection({
    bgMedia,
    overlayOpacity = 0.65,
    heightClass = PARALLAX_DEFAULTS.heightClass,
    badgeText,
    title,
    subtitle,
    id,
    children,
    index,
    contentMaxWidth = PARALLAX_DEFAULTS.contentMaxWidth
}: ParallaxSectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null)
    
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"]
    })

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 26,
        mass: 0.5,
        restDelta: 0.001
    })

    const hasTitle = !!(title || badgeText || subtitle)
    const hasChildren = !!children
    const hasCrossfade = hasTitle && hasChildren

    // ── Background: persistent parallax, never fades out ──
    const bgScale   = useTransform(smoothProgress, [0, 1], [1.01, 1.06])
    const bgOpacity = useTransform(smoothProgress, [0, 0.02, 1], [0, 1, 1])

    // ── Outer content wrapper (shared for both title layer and children layer) ──
    const wrapperOpacity = useTransform(smoothProgress, [0.0, 0.03, 0.90, 1.0], [0, 1, 1, 0])
    const wrapperScale   = useTransform(smoothProgress, [0.0, 0.03, 0.90, 1.0], [0.99, 1, 1, 0.98])

    // ── CROSSFADE MODE: title slides in first, then fades out as children replace it ──

    // Title block: fades in at start, fades out between 30%–40%
    const titleOpacity = useTransform(
        smoothProgress,
        hasCrossfade
            ? [0.0, 0.03, 0.30, 0.40, 0.90, 1.0]
            : [0.0, 0.03, 0.90, 1.0, 1.0, 1.0],
        hasCrossfade
            ? [0,   1,    1,    0,    0,   0]
            : [0,   1,    1,    0,    0,   0]
    )
    const titleY = useTransform(
        smoothProgress,
        hasCrossfade
            ? [0.0, 0.03, 0.30, 0.40]
            : [0.0, 0.03, 0.90, 1.0],
        hasCrossfade
            ? [30,  0,    0,    -40]
            : [30,  0,    0,    -40]
    )
    const titleScale = useTransform(
        smoothProgress,
        hasCrossfade
            ? [0.0, 0.03, 0.30, 0.40]
            : [0.0, 0.03, 0.90, 1.0],
        hasCrossfade
            ? [0.95, 1,   1,    0.92]
            : [0.95, 1,   1,    0.92]
    )

    // Subtitle: cascades in slightly after title, fades out with title
    const subtitleOpacity = useTransform(
        smoothProgress,
        hasCrossfade
            ? [0.0, 0.05, 0.10, 0.32, 0.42]
            : [0.0, 0.05, 0.10, 0.88, 0.95],
        hasCrossfade
            ? [0,   0,    1,    1,    0]
            : [0,   0,    1,    1,    0]
    )
    const subtitleY = useTransform(
        smoothProgress,
        hasCrossfade
            ? [0.0, 0.05, 0.10, 0.32, 0.42]
            : [0.0, 0.05, 0.10, 0.88, 0.95],
        hasCrossfade
            ? [20,  20,   0,    0,    -30]
            : [20,  20,   0,    0,    -30]
    )

    // Children: fade in as title fades out, stay visible, then fade out at end
    const childrenOpacity = useTransform(
        smoothProgress,
        [0.0, 0.32, 0.42, 0.85, 0.94, 1.0],
        [0,   0,    1,    1,    0,    0]
    )
    const childrenY = useTransform(
        smoothProgress,
        [0.0, 0.32, 0.42, 0.85, 0.94, 1.0],
        [40,  40,   0,    0,    -35,  -35]
    )

    // ── NON-CROSSFADE: children-only sections (no title) ──
    const childrenOnlyOpacity = useTransform(
        smoothProgress,
        [0.0, 0.05, 0.12, 0.88, 0.95, 1.0],
        [0,   0,    1,    1,    0,    0]
    )
    const childrenOnlyY = useTransform(
        smoothProgress,
        [0.0, 0.05, 0.12, 0.88, 0.95, 1.0],
        [24,  24,   0,    0,    -35,  -35]
    )

    const resolvedBgMedia = bgMedia || PARALLAX_DEFAULTS.fallbackBgMedia
    const isVideo = resolvedBgMedia?.endsWith('.mp4') || resolvedBgMedia?.endsWith('.webm')

    return (
        <div 
            id={id} 
            ref={sectionRef} 
            className={`relative w-full overflow-visible ${heightClass}`}
        >
            <div className="sticky top-0 h-screen w-full flex flex-col justify-end pb-32 md:pb-40 lg:pb-44 overflow-hidden">
                {/* Background Media — persistent, never fades out */}
                <motion.div 
                    className="absolute inset-0 z-0"
                    style={{ 
                        scale: bgScale,
                        opacity: bgOpacity,
                        willChange: 'transform, opacity'
                    }}
                >
                    {resolvedBgMedia ? (
                        isVideo ? (
                            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                                <source src={resolvedBgMedia} type="video/mp4" />
                            </video>
                        ) : (
                            <img src={resolvedBgMedia} alt="" className="w-full h-full object-cover" />
                        )
                    ) : null}
                    <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/90" />
                    <div className="absolute inset-0 bg-primary/6 mix-blend-overlay" />
                </motion.div>

                {/* Content area — positioned relative for stacking */}
                <motion.div
                    style={{
                        opacity: wrapperOpacity,
                        scale: wrapperScale,
                        willChange: 'transform, opacity'
                    }}
                    className={`relative z-10 w-full ${contentMaxWidth} mx-auto px-6 pointer-events-auto`}
                >
                    <div className="relative w-full">

                        {/* ═══ LAYER 1: Title + Badge + Subtitle (slides in first, then fades out) ═══ */}
                        {hasTitle && (
                            <motion.div
                                style={{
                                    opacity: titleOpacity,
                                    y: titleY,
                                    scale: titleScale,
                                    willChange: 'transform, opacity',
                                    // When crossfading, position absolutely so children can occupy same space
                                    ...(hasCrossfade ? { position: 'absolute' as const, bottom: 0, left: 0, right: 0 } : {})
                                }}
                                className={`w-full flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16 text-left select-none ${hasCrossfade ? '' : 'py-4'}`}
                            >
                                {/* Left column — Pill badge + Headline */}
                                <div className="lg:max-w-[60%] xl:max-w-[55%] flex flex-col items-start space-y-6">
                                    {/* Badge */}
                                    {badgeText && (
                                        <span className="inline-flex items-center gap-2.5 bg-foreground/10 backdrop-blur-md border border-foreground/15 rounded-full px-5 py-2 text-foreground/80 text-sm font-medium shadow-sm select-none">
                                            {badgeText} {typeof index === 'number' ? `0${index + 1}` : ''}
                                        </span>
                                    )}
                                    
                                    {/* Title */}
                                    {title && (
                                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5rem] font-bold text-white tracking-tight leading-[1.05] drop-shadow-2xl">
                                            {title}
                                        </h2>
                                    )}
                                </div>

                                {/* Right column — Description */}
                                <div className="lg:max-w-[35%] xl:max-w-[30%] lg:pb-2 flex flex-col items-start space-y-6">
                                    {/* Subtitle */}
                                    {subtitle && (
                                        <motion.p 
                                            style={{ 
                                                opacity: subtitleOpacity, 
                                                y: subtitleY,
                                                willChange: 'transform, opacity'
                                            }}
                                            className="text-base md:text-lg text-white/70 font-medium leading-relaxed drop-shadow-lg"
                                        >
                                            {subtitle}
                                        </motion.p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ LAYER 2: Children content (fades in as title fades out) ═══ */}
                        {hasChildren && (
                            <motion.div 
                                style={{
                                    opacity: hasCrossfade ? childrenOpacity : childrenOnlyOpacity,
                                    y: hasCrossfade ? childrenY : childrenOnlyY,
                                    willChange: 'transform, opacity'
                                }}
                                className="w-full max-h-[85vh] overflow-y-auto py-4 flex flex-col justify-end"
                            >
                                <div className="w-full select-none">
                                    {children}
                                </div>
                            </motion.div>
                        )}

                    </div>
                </motion.div>
            </div>
        </div>
    )
}
