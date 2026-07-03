"use client"

import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Code2, Palette, LineChart } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'
import ParallaxSection from '@/components/ParallaxSection'
import FadeIn from '@/components/animations/FadeIn'
import { EASE_OUT_EXPO } from '@/components/animations/FadeIn'

const ValueProposition = () => {
    const { getSetting } = useSettings()

    const tagline = getSetting('vp_section_tagline') || "VALUE PROPOSITION"
    const title = getSetting('vp_section_title')
    const subtitle = getSetting('vp_section_subtitle')

    const pillars = [
        {
            id: 'pillar-1',
            title: getSetting('vp_pillar1_title') || 'Technology',
            description: getSetting('vp_pillar1_description'),
            icon: Code2,
            image: getSetting('vp_pillar1_image'),
            href: '/services',
            stats: getSetting('vp_pillar1_stats'),
            tag: getSetting('vp_pillar1_tag'),
        },
        {
            id: 'pillar-2',
            title: getSetting('vp_pillar2_title') || 'Design',
            description: getSetting('vp_pillar2_description'),
            icon: Palette,
            image: getSetting('vp_pillar2_image'),
            href: '/services',
            stats: getSetting('vp_pillar2_stats'),
            tag: getSetting('vp_pillar2_tag'),
        },
        {
            id: 'pillar-3',
            title: getSetting('vp_pillar3_title') || 'Strategy',
            description: getSetting('vp_pillar3_description'),
            icon: LineChart,
            image: getSetting('vp_pillar3_image'),
            href: '/services',
            stats: getSetting('vp_pillar3_stats'),
            tag: getSetting('vp_pillar3_tag'),
        },
    ]

    const [activeTabTitle, setActiveTabTitle] = useState(pillars[0].title)
    
    // Fallback if settings load asynchronously
    useEffect(() => {
        if (!pillars.some(p => p.title === activeTabTitle)) {
            setActiveTabTitle(pillars[0].title)
        }
    }, [pillars, activeTabTitle])

    const activePillar = pillars.find(p => p.title === activeTabTitle) || pillars[0]
    const Icon = activePillar.icon

    const bgMedia = getSetting('bg_home_value_proposition')

    return (
        <ParallaxSection
            id="value-proposition"
            bgMedia={bgMedia}
            heightClass="min-h-[230vh]"
            badgeText={tagline}
            title={title}
            subtitle={subtitle}
            contentMaxWidth="max-w-[1400px]"
            toolbarTitle="Core Values"
            tabs={pillars.map(p => p.title)}
            activeTab={activeTabTitle}
            onTabChange={setActiveTabTitle}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={activePillar.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                    className="flex flex-col lg:flex-row gap-8 lg:gap-16 pt-4"
                >
                    {/* Text Content */}
                    <div className="flex-1 flex flex-col justify-center items-start text-left">
                        <Icon className="h-12 w-12 text-primary mb-6 drop-shadow-lg" />
                        {activePillar.tag && (
                            <FadeIn direction="up" distance={16} blur={false}>
                                <span className="inline-block px-4 py-1.5 rounded-full bg-foreground/10 border border-foreground/10 text-foreground/80 text-xs font-bold uppercase tracking-widest mb-6">
                                    {activePillar.tag}
                                </span>
                            </FadeIn>
                        )}
                        <h3 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                            {activePillar.title}
                        </h3>
                        <p className="text-foreground/70 text-base md:text-lg leading-relaxed mb-8">
                            {activePillar.description}
                        </p>

                        {activePillar.stats && (
                            <div className="text-primary font-bold text-xl mb-8">
                                {activePillar.stats}
                            </div>
                        )}

                        <Link
                            href={activePillar.href}
                            className="inline-flex items-center gap-2 text-foreground font-bold uppercase tracking-wider text-sm hover:text-primary transition-colors group"
                        >
                            Learn More
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    {/* Image Content */}
                    <FadeIn
                        className="flex-1"
                        direction="right"
                        distance={40}
                        delay={0.15}
                        duration={0.9}
                    >
                        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-foreground/10 bg-foreground/5">
                            {activePillar.image ? (
                                <Image
                                    src={activePillar.image}
                                    alt={activePillar.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background" />
                            )}
                        </div>
                    </FadeIn>
                </motion.div>
            </AnimatePresence>
        </ParallaxSection>
    )
}

export default ValueProposition
