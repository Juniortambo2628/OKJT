"use client"

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, ChevronRight } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'
import { useApi } from '@/hooks/use-api'
import { getMediaUrl } from '@/lib/utils'
import { DEFAULT_HERO_VIDEO } from '@/lib/config'
import { HeroSkeleton, SkeletonBlock, SkeletonText } from './MediaSkeleton'
import { cn } from '@/lib/utils'

interface HeroCta {
    label: string
    href: string
}

interface BreadcrumbItem {
    label: string
    href?: string
}

interface HeroProps {
    id?: string
    tagline?: string
    title?: React.ReactNode
    subtitle?: string
    videos?: string[]
    bgImage?: string
    fallbackVideo?: string
    cta?: HeroCta | null
    breadcrumbs?: BreadcrumbItem[]
    showTrustBar?: boolean
    className?: string
    children?: React.ReactNode
    loading?: boolean
}

// ------------------------------------------------------------------
// Animation presets — shared across the hero for a cohesive feel
// ------------------------------------------------------------------

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
const EASE_IN_OUT_SMOOTH = [0.65, 0, 0.35, 1] as const

const fadeUp = {
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.9, ease: EASE_OUT_EXPO }
    }
}

const staggerContainer = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12, delayChildren: 0.25 }
    }
}

const scaleIn = {
    hidden: { opacity: 0, scale: 1.08 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 1.4, ease: EASE_IN_OUT_SMOOTH }
    }
}

// ------------------------------------------------------------------
// Inline breadcrumbs for detail pages
// ------------------------------------------------------------------

const HeroBreadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => {
    if (!items || items.length === 0) return null
    return (
        <motion.nav variants={fadeUp} className="mb-6" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-foreground/50">
                <li>
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                        <ChevronRight className="h-3.5 w-3.5" />
                        {item.href ? (
                            <Link href={item.href} className="hover:text-primary transition-colors">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-foreground/80">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </motion.nav>
    )
}

// ------------------------------------------------------------------
// Trust bar shown on the landing page
// ------------------------------------------------------------------

const TrustBar = ({ clients }: { clients?: unknown[] }) => {
    const activeClients = clients && Array.isArray(clients) ? clients.slice(0, 6) : []
    if (activeClients.length === 0) return null

    return (
        <motion.div
            variants={fadeUp}
            className="mt-16 pt-8 border-t border-white/10"
        >
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-6 font-medium">
                Trusted by visionary brands
            </p>
            <div className="flex flex-wrap items-center gap-8">
                {activeClients.map((client: any, index) => (
                    <motion.div
                        key={client.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + index * 0.08, duration: 0.6, ease: EASE_OUT_EXPO }}
                        className="h-8 w-28 bg-white/10 rounded-md opacity-60 hover:opacity-100 transition-opacity"
                        style={{
                            maskImage: client.logo ? 'none' : undefined,
                            WebkitMaskImage: client.logo ? 'none' : undefined,
                        }}
                    >
                        {client.logo && (
                            <img
                                src={getMediaUrl(client.logo)}
                                alt={client.name || 'Client logo'}
                                className="h-full w-full object-contain object-left filter brightness-150"
                            />
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

// ------------------------------------------------------------------
// Rotating headline used by the landing page when no explicit title is passed
// ------------------------------------------------------------------

const RotatingHeadline = ({
    titleLine1,
    titleLine2,
    rotatingWords,
    prefersReducedMotion
}: {
    titleLine1?: string
    titleLine2?: string
    rotatingWords: string[]
    prefersReducedMotion: boolean
}) => {
    const [currentWord, setCurrentWord] = useState(0)

    useEffect(() => {
        if (rotatingWords.length === 0 || prefersReducedMotion) return
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % rotatingWords.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [rotatingWords.length, prefersReducedMotion])

    if (rotatingWords.length === 0) {
        return (
            <>
                {titleLine1}
                {titleLine1 && <br />}
                {titleLine2}
            </>
        )
    }

    return (
        <>
            {titleLine1}
            {titleLine1 && <br />}
            <span className="relative inline-block min-w-[200px] md:min-w-[320px]">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={currentWord}
                        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#dcc089] to-white/80 drop-shadow-[0_0_15px_rgba(235,200,130,0.3)]"
                    >
                        {rotatingWords[currentWord % rotatingWords.length]}
                    </motion.span>
                </AnimatePresence>
            </span>
            <br />
            {titleLine2}
        </>
    )
}

// ------------------------------------------------------------------
// Background media — video with smooth crossfade, or image with Ken Burns
// ------------------------------------------------------------------

const HeroBackground = ({
    videos,
    bgImage,
    prefersReducedMotion
}: {
    videos: string[]
    bgImage?: string
    prefersReducedMotion: boolean
}) => {
    const [videoIndex, setVideoIndex] = useState(0)
    const { scrollY } = useScroll()
    const y = useTransform(scrollY, [0, 800], prefersReducedMotion ? [0, 0] : [0, 200])
    const opacity = useTransform(scrollY, [0, 600], [1, 0])
    const scale = useTransform(scrollY, [0, 600], prefersReducedMotion ? [1, 1] : [1, 1.1])

    const handleVideoEnd = () => {
        setVideoIndex((prev) => (prev + 1) % videos.length)
    }

    // Preload the current and next video for seamless switching
    useEffect(() => {
        if (videos.length <= 1) return
        const nextIndex = (videoIndex + 1) % videos.length
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'fetch'
        link.href = videos[nextIndex]
        document.head.appendChild(link)
        return () => { document.head.removeChild(link) }
    }, [videoIndex, videos])

    return (
        <motion.div
            className="absolute inset-0 z-0"
            style={{ y, scale, opacity }}
        >
            {videos.length > 0 ? (
                <AnimatePresence mode="sync">
                    <motion.video
                        key={`${videoIndex}-${videos[videoIndex % videos.length]}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: EASE_IN_OUT_SMOOTH }}
                        autoPlay
                        muted
                        playsInline
                        loop={videos.length === 1}
                        onEnded={videos.length > 1 ? handleVideoEnd : undefined}
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src={videos[videoIndex % videos.length]} type="video/mp4" />
                    </motion.video>
                </AnimatePresence>
            ) : bgImage ? (
                <motion.div
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.4, ease: EASE_IN_OUT_SMOOTH }}
                    className="absolute inset-0"
                >
                    <img src={bgImage} alt="" className="w-full h-full object-cover" />
                </motion.div>
            ) : null}

            {/* Overlays for depth and readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/60 to-background" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(235,200,130,0.15)_0%,transparent_80%)]" />
        </motion.div>
    )
}

// ------------------------------------------------------------------
// Main Hero component
// ------------------------------------------------------------------

const Hero = ({
    id,
    tagline: taglineProp,
    title: titleProp,
    subtitle: subtitleProp,
    videos: videosProp,
    bgImage: bgImageProp,
    fallbackVideo = DEFAULT_HERO_VIDEO,
    cta: ctaProp,
    breadcrumbs: breadcrumbsProp,
    showTrustBar = false,
    className,
    children,
    loading: loadingProp
}: HeroProps) => {
    const { getSetting, isLoading: settingsLoading } = useSettings()
    const { data: clients } = useApi('/clients')
    const prefersReducedMotion = useReducedMotion()

    const isLoading = loadingProp ?? settingsLoading

    const resolvedBgImage = useMemo(() =>
        bgImageProp ? getMediaUrl(bgImageProp) : undefined,
        [bgImageProp]
    )

    // Resolve videos: explicit prop > settings > fallback
    // If an explicit bgImage is provided without videos, leave videos empty so the image is used.
    const videos = useMemo(() => {
        if (videosProp) return videosProp.filter(Boolean).map(getMediaUrl)

        const settingVideos = [
            getSetting('hero_home_video_1'),
            getSetting('hero_home_video_2'),
            getSetting('hero_home_video_3')
        ].filter(Boolean).map(getMediaUrl)

        if (settingVideos.length > 0) return settingVideos
        if (resolvedBgImage) return []
        return [getMediaUrl(fallbackVideo)].filter(Boolean)
    }, [videosProp, getSetting, fallbackVideo, resolvedBgImage])

    // Resolve content: explicit prop > setting
    const tagline = taglineProp ?? getSetting('hero_tagline')
    const subtitle = subtitleProp ?? getSetting('hero_subtitle')
    const titleLine1 = getSetting('hero_title_line1')
    const titleLine2 = getSetting('hero_title_line2')
    const rotatingWords = useMemo(() =>
        (getSetting('hero_rotating_words') ?? '').split(',').filter(Boolean),
        [getSetting]
    )

    const resolvedCta = useMemo<HeroCta | null>(() => {
        if (ctaProp === null) return null
        return ctaProp ?? { label: 'Explore Our Projects', href: '/projects' }
    }, [ctaProp])

    const resolvedTitle = useMemo(() => {
        if (titleProp !== undefined) return titleProp
        return (
            <RotatingHeadline
                titleLine1={titleLine1}
                titleLine2={titleLine2}
                rotatingWords={rotatingWords}
                prefersReducedMotion={!!prefersReducedMotion}
            />
        )
    }, [titleProp, titleLine1, titleLine2, rotatingWords, prefersReducedMotion])

    // Preload the first hero video
    useEffect(() => {
        if (videos[0]) {
            const link = document.createElement('link')
            link.rel = 'preload'
            link.as = 'fetch'
            link.href = videos[0]
            document.head.appendChild(link)
            return () => { document.head.removeChild(link) }
        }
    }, [videos])

    return (
        <section
            id={id}
            className={cn(
                "relative min-h-screen flex flex-col overflow-hidden",
                className
            )}
        >
            {/* Full-screen Background Video with Parallax + Zoom on Scroll */}
            {!isLoading && <HeroBackground videos={videos} bgImage={resolvedBgImage} prefersReducedMotion={!!prefersReducedMotion} />}

            {/* Dot Grid */}
            <div
                className="absolute inset-0 z-[1] opacity-15 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Content — pushed to the bottom of the viewport */}
            <div className="relative z-10 mt-auto px-6 md:px-10 lg:px-16 pb-24 md:pb-32 lg:pb-40">
                <motion.div
                    className="max-w-[1400px] mx-auto w-full"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Split-column bottom layout */}
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16">

                        {/* Left column — Breadcrumbs + Pill badge + Headline */}
                        <div className="lg:max-w-[60%] xl:max-w-[55%]">
                            {breadcrumbsProp && !isLoading && <HeroBreadcrumbs items={breadcrumbsProp} />}

                            {/* Pill Badge */}
                            {isLoading ? (
                                <SkeletonBlock className="h-9 w-48 rounded-full mb-8" />
                            ) : tagline && (
                                <motion.div
                                    variants={fadeUp}
                                    className="inline-flex items-center gap-2.5 bg-foreground/10 backdrop-blur-md border border-foreground/15 rounded-full px-5 py-2 mb-8 cursor-pointer hover:bg-foreground/15 transition-colors group"
                                >
                                    <span className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                                        <Play className="h-3 w-3 text-foreground/90 fill-current ml-0.5" />
                                    </span>
                                    <span className="text-foreground/80 text-sm font-medium">{tagline}</span>
                                </motion.div>
                            )}

                            {/* Headline */}
                            <motion.h1
                                variants={fadeUp}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5rem] font-bold tracking-tight leading-[1.05] text-foreground"
                            >
                                {isLoading ? (
                                    <div className="space-y-4">
                                        <SkeletonBlock className="h-12 md:h-16 w-full rounded-md" />
                                        <SkeletonBlock className="h-12 md:h-16 w-4/5 rounded-md" />
                                    </div>
                                ) : typeof resolvedTitle === 'string' ? (
                                    <span dangerouslySetInnerHTML={{ __html: resolvedTitle }} />
                                ) : (
                                    resolvedTitle
                                )}
                            </motion.h1>
                        </div>

                        {/* Right column — Description + CTA */}
                        <div className="lg:max-w-[35%] xl:max-w-[30%] lg:pb-2">
                            {isLoading ? (
                                <SkeletonText lines={3} className="mb-8" />
                            ) : subtitle && (
                                <motion.p
                                    variants={fadeUp}
                                    className="text-base md:text-lg text-foreground/60 mb-8 font-medium leading-relaxed"
                                >
                                    {subtitle}
                                </motion.p>
                            )}

                            {/* CTA Button */}
                            {!isLoading && resolvedCta && (
                                <motion.div variants={fadeUp}>
                                    <Button
                                        size="lg"
                                        className="h-12 px-8 text-sm font-semibold rounded-full bg-foreground/10 backdrop-blur-md border border-foreground/15 text-foreground hover:bg-foreground/20 transition-all group shadow-lg"
                                        asChild
                                    >
                                        <Link href={resolvedCta.href}>
                                            {resolvedCta.label}
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                </motion.div>
                            )}

                            {/* Extra children (e.g. breadcrumbs, metadata) */}
                            {children}
                        </div>
                    </div>

                    {/* Optional trust bar */}
                    {showTrustBar && !isLoading && <TrustBar clients={clients} />}
                </motion.div>
            </div>
        </section>
    )
}

export default Hero
