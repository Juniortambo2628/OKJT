"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Rocket } from 'lucide-react'
import { useApi } from '@/hooks/use-api'

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

const Hero = () => {
    const { data: settingsByGroup } = useApi('/settings')
    const { scrollY } = useScroll()
    const y = useTransform(scrollY, [0, 800], [0, 200])
    const opacity = useTransform(scrollY, [0, 600], [1, 0])
    const scale = useTransform(scrollY, [0, 600], [1, 1.1])

    const [currentWord, setCurrentWord] = useState(0)
    const [videoIndex, setVideoIndex] = useState(0)
    
    // Helper to get setting value
    const getSetting = (key: string, defaultValue: string) => {
        if (!settingsByGroup) return defaultValue
        const allSettings = Object.values(settingsByGroup).flat() as any[]
        const setting = allSettings.find(s => s.key === key)
        return setting?.value || defaultValue
    }

    const videos = [
        getSetting('hero_home_video_1', '/assets/videos/services/all-services-video.mp4'),
        getSetting('hero_home_video_2', '/assets/videos/services/fintech-video.mp4'),
        getSetting('hero_home_video_3', '/assets/videos/services/energy-advisory.mp4')
    ]

    const handleVideoEnd = () => {
        setVideoIndex((prev) => (prev + 1) % videos.length)
    }

    const tagline = getSetting('hero_tagline', 'Design-led Web Engineering')
    const titleLine1 = getSetting('hero_title_line1', 'We Build')
    const titleLine2 = getSetting('hero_title_line2', 'For Impact.')
    const subtitle = getSetting('hero_subtitle', 'Design-centered, user-first web experiences that are fast, responsive, and built to drive results.')
    const rotatingWords = getSetting('hero_rotating_words', 'Web Applications.,Stunning Interfaces.,Digital Platforms.').split(',')

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % rotatingWords.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [rotatingWords.length])

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* Full-screen Background Video with Parallax + Zoom on Scroll */}
            <motion.div className="absolute inset-0 z-0" style={{ y, scale }}>
                <AnimatePresence mode="wait">
                    <motion.video
                        key={videoIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        autoPlay
                        muted
                        playsInline
                        onEnded={handleVideoEnd}
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src={videos[videoIndex]} type="video/mp4" />
                    </motion.video>
                </AnimatePresence>
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

            {/* Content */}
            <motion.div className="container relative z-10 mx-auto px-6 pt-32 pb-20" style={{ opacity }}>
                <motion.div
                    className="max-w-5xl mx-auto text-center"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Pill Badge */}
                    <motion.div
                        variants={fadeUp}
                        className="inline-flex items-center gap-2 bg-foreground/10 backdrop-blur-md border border-foreground/20 rounded-full px-6 py-2 mb-10"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-foreground/80 text-sm font-medium">{tagline}</span>
                    </motion.div>

                    {/* Headline with Rotating Word */}
                    <motion.h1
                        variants={fadeUp}
                        className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-8 leading-[1.05] text-foreground"
                    >
                        {titleLine1}<br />
                        <span className="relative inline-block min-w-[280px] md:min-w-[400px]">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={currentWord}
                                    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                                    transition={{ duration: 0.8, ease: "circOut" }}
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#dcc089] to-white/80 drop-shadow-[0_0_15px_rgba(235,200,130,0.3)]"
                                >
                                    {rotatingWords[currentWord]}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                        <br />
                        {titleLine2}
                    </motion.h1>

                    {/* Divider */}
                    <motion.div
                        variants={fadeUp}
                        className="w-32 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8"
                    />

                    {/* Subheadline */}
                    <motion.p
                        variants={fadeUp}
                        className="text-xl md:text-2xl text-foreground/60 mb-14 font-medium max-w-3xl mx-auto leading-relaxed"
                    >
                        {subtitle}
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        variants={fadeUp}
                        className="flex flex-col sm:flex-row items-center justify-center gap-5"
                    >
                        <Button
                            size="lg"
                            className="h-14 px-10 text-base font-bold rounded-none bg-primary hover:bg-primary/90 text-[#14110b] border-none transition-all hover:scale-[1.03] active:scale-[0.98] group shadow-xl shadow-primary/20"
                            asChild
                        >
                            <Link href="/portfolio">
                                Explore Our Portfolio
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 px-10 text-base font-bold rounded-none border-primary/20 text-foreground hover:bg-primary/10 backdrop-blur-sm transition-all group"
                            asChild
                        >
                            <Link href="/contact">
                                <Rocket className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                                Start a Project
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.5 }}
                        className="mt-20"
                    >
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="flex flex-col items-center gap-2"
                        >
                            <span className="text-foreground/30 text-xs uppercase tracking-widest">Scroll to explore</span>
                            <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center pt-2">
                                <motion.div
                                    animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-1.5 h-1.5 bg-primary rounded-full"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    )
}

export default Hero
