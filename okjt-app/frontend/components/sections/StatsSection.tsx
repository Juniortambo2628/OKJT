"use client"

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useApi } from '@/hooks/use-api'
import { getMediaUrl } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'
import { Stat } from '@/types/api'
import ParallaxSection from '@/components/ParallaxSection'
import { SectionCard } from '@/components/ui/SectionCard'
import CountUp from '@/components/animations/CountUp'
import FadeIn from '@/components/animations/FadeIn'

const StatsSection = () => {
    const { data: stats, isLoading: statsLoading } = useApi<Stat[]>('/stats')
    const { getSetting } = useSettings()
    const { scrollY } = useScroll()
    const backgroundY = useTransform(scrollY, [0, 3000], [0, -80])

    const sectionTagline = getSetting('stats_tagline')
    const sectionTitle = getSetting('stats_title')
    const sectionImage = getSetting('stats_background')
    const backgroundMedia = getMediaUrl(sectionImage)
    const hasBackground = !!backgroundMedia
    const isVideoBackground = hasBackground && /\.(mp4|webm|ogg)(\?.*)?$/i.test(backgroundMedia)

    if (statsLoading) {
        return (
            <section className="w-full py-32 bg-background">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="text-center mb-20">
                        <div className="h-4 w-36 bg-secondary/20 rounded-full mx-auto mb-5 animate-pulse" />
                        <div className="h-10 md:h-14 w-full max-w-lg bg-secondary/20 rounded-md mx-auto mb-6 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="text-center p-8 md:p-10 border-r border-border/50">
                                <div className="h-16 w-24 bg-secondary/20 rounded-md mx-auto mb-4 animate-pulse" />
                                <div className="h-4 w-20 bg-secondary/20 rounded-full mx-auto mb-3 animate-pulse" />
                                <div className="h-3 w-32 bg-secondary/20 rounded-full mx-auto animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (!stats || stats.length === 0) return null

    return (
        <ParallaxSection
            id="stats"
            bgMedia={backgroundMedia || getSetting('bg_home_stats')}
            heightClass="min-h-[230vh]"
            badgeText={sectionTagline || "KEY PERFORMANCE METRICS"}
            title={sectionTitle}
            contentMaxWidth="max-w-[1400px]"
        >
            <SectionCard className="p-0 sm:p-0 md:p-0 overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 w-full h-full divide-x divide-y md:divide-y-0 divide-foreground/10">
                    {stats.map((stat, index) => (
                        <FadeIn
                            key={stat.id}
                            direction="up"
                            distance={30}
                            delay={index * 0.1}
                            blur={false}
                            className="text-center p-6 md:p-10 relative group"
                        >
                            {/* Hover glow */}
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-500" />

                            <div className="relative z-10">
                                <div className="text-primary font-bold text-4xl sm:text-5xl md:text-6xl mb-4 tracking-tight">
                                    <CountUp target={stat.value} />
                                </div>
                                <div className="w-8 h-[2px] bg-primary/40 mx-auto mb-4" />
                                <div className="text-foreground text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-3">
                                    {stat.label}
                                </div>
                                <div className="text-foreground/60 text-xs max-w-[200px] mx-auto leading-relaxed">
                                    {stat.description || 'Delivering results through design-led engineering.'}
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </SectionCard>
        </ParallaxSection>
    )
}


export default StatsSection
