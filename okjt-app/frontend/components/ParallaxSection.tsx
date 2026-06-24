"use client"

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { SkeletonBlock } from '@/components/MediaSkeleton'

interface ParallaxSectionProps {
    bgMedia?: string | null
    overlayOpacity?: number
    heightClass?: string // e.g. "min-h-[230vh]"
    badgeText?: string
    title?: string | React.ReactNode
    subtitle?: string | React.ReactNode
    id?: string
    children?: React.ReactNode
    index?: number
    contentMaxWidth?: string // e.g. "max-w-4xl" or "max-w-[1400px]"
}

/**
 * ParallaxSection — a 1:1 refactor of the OurApproach PillarSection.
 *
 * Behaviour (identical to PillarSection):
 * - The outer `div` is tall (min-h-[230vh]) so there is plenty of scroll runway.
 * - Inside it, a `sticky top-0 h-screen` container pins the viewport.
 * - Background media scales subtly and NEVER fades out (stays persistent).
 * - Content fades in quickly (0→4%), stays visible ~90%, fades out (94→100%).
 * - Subtitle and children cascade in/out with staggered timings.
 * - Adjacent sections transition seamlessly: as one section's content
 *   fades out, the next section's content fades in — no dead scroll space.
 */
export default function ParallaxSection({
    bgMedia,
    overlayOpacity = 0.65,
    heightClass = "min-h-[230vh]",
    badgeText,
    title,
    subtitle,
    id,
    children,
    index,
    contentMaxWidth = "max-w-[1400px]"
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

    // ── Timing: exact replica of PillarSection ──

    // Main content container: enters quickly, stays completely visible, fades out at the very end
    const contentOpacity = useTransform(smoothProgress, [0.0, 0.05, 0.95, 1.0], [0, 1, 1, 0])
    const contentScale  = useTransform(smoothProgress, [0.0, 0.05, 0.95, 1.0], [0.99, 1, 1, 0.98])
    const contentY      = useTransform(smoothProgress, [0.0, 0.05, 0.95, 1.0], [20, 0, 0, -40])

    // Subtitle: cascades in slightly after title, stays persistent
    const subtitleOpacity = useTransform(smoothProgress, [0.0, 0.03, 0.09, 0.91, 0.97, 1.0], [0, 0, 1, 1, 0, 0])
    const subtitleY       = useTransform(smoothProgress, [0.0, 0.03, 0.09, 0.91, 0.97, 1.0], [16, 16, 0, 0, -30, -30])

    // Children / detail: cascades in after subtitle, stays persistent
    const detailOpacity = useTransform(smoothProgress, [0.0, 0.05, 0.12, 0.88, 0.95, 1.0], [0, 0, 1, 1, 0, 0])
    const detailY       = useTransform(smoothProgress, [0.0, 0.05, 0.12, 0.88, 0.95, 1.0], [24, 24, 0, 0, -35, -35])

    // Background: persistent parallax scale, never fades out
    const bgScale   = useTransform(smoothProgress, [0, 1], [1.01, 1.06])
    const bgOpacity = useTransform(smoothProgress, [0, 0.02, 1], [0, 1, 1])

    const isVideo = bgMedia?.endsWith('.mp4') || bgMedia?.endsWith('.webm')

    return (
        <div 
            id={id} 
            ref={sectionRef} 
            className={`relative w-full overflow-visible ${heightClass}`}
        >
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
                {/* Background Media — persistent, never fades out */}
                <motion.div 
                    className="absolute inset-0 z-0"
                    style={{ 
                        scale: bgScale,
                        opacity: bgOpacity,
                        willChange: 'transform, opacity'
                    }}
                >
                    {bgMedia ? (
                        isVideo ? (
                            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                                <source src={bgMedia} type="video/mp4" />
                            </video>
                        ) : (
                            <img src={bgMedia} alt="" className="w-full h-full object-cover" />
                        )
                    ) : (
                        <SkeletonBlock className="h-full w-full" />
                    )}
                    <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/90" />
                    <div className="absolute inset-0 bg-primary/6 mix-blend-overlay" />
                </motion.div>

                {/* Content — sticky, persistent, with staggered cascading reveals */}
                <motion.div 
                    style={{ 
                        opacity: contentOpacity, 
                        scale: contentScale,
                        y: contentY,
                        willChange: 'transform, opacity'
                    }}
                    className={`relative z-10 w-full ${contentMaxWidth} px-6 flex items-center justify-center pointer-events-auto max-h-[85vh] overflow-y-auto`}
                >
                    <div className="w-full text-center flex flex-col items-center justify-center space-y-4 md:space-y-6 select-none py-4">
                        {/* Badge */}
                        {badgeText && (
                            <span className="inline-block bg-white/10 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full text-primary font-bold tracking-[0.25em] uppercase text-[10px] sm:text-xs shadow-sm select-none">
                                {badgeText} {typeof index === 'number' ? `0${index + 1}` : ''}
                            </span>
                        )}
                        
                        {/* Title */}
                        {title && (
                            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-3xl drop-shadow-2xl">
                                {title}
                            </h2>
                        )}

                        {title && <div className="w-20 h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />}

                        {/* Subtitle — staggered cascade */}
                        {subtitle && (
                            <motion.p 
                                style={{ 
                                    opacity: subtitleOpacity, 
                                    y: subtitleY,
                                    willChange: 'transform, opacity'
                                }}
                                className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 font-medium leading-relaxed max-w-2xl drop-shadow-lg"
                            >
                                {subtitle}
                            </motion.p>
                        )}

                        {/* Children / detail content — staggered cascade after subtitle */}
                        {children && (
                            <motion.div 
                                style={{ 
                                    opacity: detailOpacity, 
                                    y: detailY,
                                    willChange: 'transform, opacity'
                                }}
                                className="w-full"
                            >
                                {children}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
