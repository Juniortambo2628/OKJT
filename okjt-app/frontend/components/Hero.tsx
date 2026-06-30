"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'
import { useApi } from '@/hooks/use-api'
import { getMediaUrl } from '@/lib/utils'
import { HeroSkeleton, SkeletonBlock, SkeletonText } from './MediaSkeleton'

const staggerContainer = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
}

const fadeUp = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: {
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { type: "spring" as const, stiffness: 60, damping: 18 }
    }
}

const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut" as const }
    }
}

const Hero = () => {
    const { getSetting, isLoading } = useSettings()
    const { data: clients } = useApi('/clients')
    const { scrollY } = useScroll()
    const y = useTransform(scrollY, [0, 800], [0, 200])
    const opacity = useTransform(scrollY, [0, 600], [1, 0])
    const scale = useTransform(scrollY, [0, 600], [1, 1.1])

    const [currentWord, setCurrentWord] = useState(0)
    const [videoIndex, setVideoIndex] = useState(0)
    const videos = [
        getSetting('hero_home_video_1'),
        getSetting('hero_home_video_2'),
        getSetting('hero_home_video_3')
    ].filter(Boolean).map(getMediaUrl)

    // Preload the first hero video
    useEffect(() => {
        if (videos[0]) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'fetch';
            link.href = videos[0];
            document.head.appendChild(link);
            return () => { document.head.removeChild(link); };
        }
    }, [videos]);

    const handleVideoEnd = () => {
        setVideoIndex((prev) => (prev + 1) % videos.length)
    }

    const tagline = getSetting('hero_tagline')
    const titleLine1 = getSetting('hero_title_line1')
    const titleLine2 = getSetting('hero_title_line2')
    const subtitle = getSetting('hero_subtitle')
    const rotatingWords = getSetting('hero_rotating_words').split(',').filter(Boolean)

    useEffect(() => {
        if (rotatingWords.length === 0) return
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % rotatingWords.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [rotatingWords.length])

    // Prepare client logos for the trust bar
    const activeClients = clients && Array.isArray(clients) ? clients.slice(0, 6) : []

    return (
        <section id="hero" className="relative min-h-screen flex flex-col overflow-hidden">
            {/* Full-screen Background Video with Parallax + Zoom on Scroll */}
            <motion.div className="absolute inset-0 z-0" style={{ y, scale }}>
                {isLoading ? null : videos.length > 0 ? (
                    <AnimatePresence>
                        <motion.video
                            key={videoIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            autoPlay
                            muted
                            playsInline
                            onEnded={handleVideoEnd}
                            className="absolute inset-0 w-full h-full object-cover"
                        >
                            <source src={videos[videoIndex % videos.length]} type="video/mp4" />
                        </motion.video>
                    </AnimatePresence>
                ) : null}
                {/* Overlays for depth and readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/60 to-background" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(235,200,130,0.15)_0%,transparent_80%)]" />
            </motion.div>

            {/* Dot Grid */}
            <div className="absolute inset-0 z-[1] opacity-15"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '60px 60px',
                }} />

            {/* Content — pushed to the bottom of the viewport */}
            <motion.div className="relative z-10 mt-auto px-6 md:px-10 lg:px-16 pb-24 md:pb-32 lg:pb-40" style={{ opacity }}>
                <motion.div
                    className="max-w-[1400px] mx-auto w-full"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Split-column bottom layout */}
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16">

                        {/* Left column — Pill badge + Headline */}
                        <div className="lg:max-w-[60%] xl:max-w-[55%]">
                            {/* Pill Badge — "Watch the Vision" style */}
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
                                ) : (
                                    <>
                                        {titleLine1}
                                        {titleLine1 && <br />}
                                        {rotatingWords.length > 0 && (
                                            <>
                                                <span className="relative inline-block min-w-[200px] md:min-w-[320px]">
                                                    <AnimatePresence mode="wait">
                                                        <motion.span
                                                            key={currentWord}
                                                            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                                            exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                                                            transition={{ duration: 0.8, ease: "circOut" }}
                                                            className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#dcc089] to-white/80 drop-shadow-[0_0_15px_rgba(235,200,130,0.3)]"
                                                        >
                                                            {rotatingWords[currentWord % rotatingWords.length]}
                                                        </motion.span>
                                                    </AnimatePresence>
                                                </span>
                                                <br />
                                            </>
                                        )}
                                        {titleLine2}
                                    </>
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

                            {/* CTA Button — pill-shaped like in design */}
                            <motion.div variants={fadeUp}>
                                <Button
                                    size="lg"
                                    className="h-12 px-8 text-sm font-semibold rounded-full bg-foreground/10 backdrop-blur-md border border-foreground/15 text-foreground hover:bg-foreground/20 transition-all group shadow-lg"
                                    asChild
                                >
                                    <Link href="/projects">
                                        Explore Our Projects
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>
                    </div>

                </motion.div>
            </motion.div>
        </section>
    )
}

export default Hero
