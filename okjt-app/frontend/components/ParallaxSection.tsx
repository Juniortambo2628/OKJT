"use client"

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { SkeletonBlock } from '@/components/MediaSkeleton'
import { PARALLAX_DEFAULTS } from '@/lib/config'
import { SectionCard } from '@/components/ui/SectionCard'

interface ParallaxSectionProps {
    bgMedia?: string | null
    overlayOpacity?: number
    heightClass?: string
    badgeText?: string
    title?: string | React.ReactNode
    subtitle?: string | React.ReactNode
    cta?: { label: string; href: string } | null
    toolbarTitle?: string
    tabs?: string[]
    activeTab?: string
    onTabChange?: (tab: string) => void
    id?: string
    children?: React.ReactNode
    contentMaxWidth?: string
    loading?: boolean
    className?: string
}

/**
 * ParallaxSection — scroll-driven sticky section with a large content card.
 *
 * The background media stays pinned with a subtle parallax scale.
 * The SectionCard slides in and contains: badge, heading, subtitle, optional CTA,
 * and a scrollable carousel slot (children).
 */
export default function ParallaxSection({
    bgMedia,
    overlayOpacity = 0.65,
    heightClass = PARALLAX_DEFAULTS.heightClass,
    badgeText,
    title,
    subtitle,
    cta,
    toolbarTitle,
    tabs,
    activeTab,
    onTabChange,
    id,
    children,
    contentMaxWidth = PARALLAX_DEFAULTS.contentMaxWidth,
    loading = false,
    className
}: ParallaxSectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"]
    })

    // Softer spring so the sticky card doesn't fight the scroll thumb on
    // touch devices — higher damping, lower stiffness, larger restDelta.
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 60,
        damping: 30,
        mass: 0.4,
        restDelta: 0.005,
    })

    const bgScale = useTransform(smoothProgress, [0, 1], [1.01, 1.05])
    const bgOpacity = useTransform(smoothProgress, [0, 0.02, 1], [0, 1, 1])

    // Card fade windows widened at the tail so the exit is gentler.
    const cardOpacity = useTransform(smoothProgress, [0.0, 0.05, 0.85, 1.0], [0, 1, 1, 0])
    const cardY = useTransform(smoothProgress, [0.0, 0.05, 0.85, 1.0], [30, 0, 0, -20])

    const resolvedBgMedia = bgMedia || PARALLAX_DEFAULTS.fallbackBgMedia
    const isVideo = resolvedBgMedia?.endsWith('.mp4') || resolvedBgMedia?.endsWith('.webm')

    return (
        <div
            id={id}
            ref={sectionRef}
            className={`relative w-full overflow-visible ${heightClass}`}
        >
            <div className="sticky top-0 h-screen w-full flex flex-col justify-end pb-16 md:pb-28 lg:pb-32 overflow-hidden">
                {/* Background Media */}
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
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
                    <div className="absolute inset-0 bg-primary/6 mix-blend-overlay" />
                </motion.div>

                {/* Content Card */}
                <motion.div
                    style={{
                        opacity: cardOpacity,
                        y: cardY,
                        willChange: 'transform, opacity'
                    }}
                    className={`relative z-10 w-full ${contentMaxWidth} mx-auto px-4 md:px-6 pointer-events-auto`}
                >
                    {loading ? (
                        <div className="w-full h-[75vh] rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 p-8">
                            <SkeletonBlock className="h-8 w-32 rounded-full mb-6" />
                            <SkeletonBlock className="h-16 w-3/4 rounded-xl mb-4" />
                            <SkeletonBlock className="h-16 w-1/2 rounded-xl mb-8" />
                            <SkeletonBlock className="h-10 w-40 rounded-full" />
                        </div>
                    ) : (
                        <SectionCard
                            badgeText={badgeText}
                            title={title}
                            subtitle={subtitle}
                            cta={cta}
                            toolbarTitle={toolbarTitle}
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={onTabChange}
                            className={className}
                        >
                            {children}
                        </SectionCard>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
