"use client"

import React, { useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { getMediaUrl } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'
import { Stat } from '@/types/api'
import ParallaxSection from '@/components/ParallaxSection'
import CountUp from '@/components/animations/CountUp'

const StatsSection = () => {
    const { data: stats, isLoading: statsLoading } = useApi<Stat[]>('/stats')
    const { getSetting } = useSettings()

    const sectionTagline = getSetting('stats_tagline')
    const sectionTitle = getSetting('stats_title')
    const sectionImage = getSetting('stats_background')
    const backgroundMedia = getMediaUrl(sectionImage)

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

    return <StatsAccordion stats={stats} tagline={sectionTagline} title={sectionTitle} bgMedia={backgroundMedia || getSetting('bg_home_stats')} />
}

/**
 * Horizontal accordion — inspired by the reference site: each stat sits inside
 * a collapsed vertical column showing only its label. Click / focus a column to
 * expand it and reveal the count and description; the other columns compress.
 */
function StatsAccordion({ stats, tagline, title, bgMedia }: { stats: Stat[] | undefined, tagline: string | undefined, title: string | undefined, bgMedia?: string | null }) {
    const [openIndex, setOpenIndex] = useState(0)

    if (!stats || stats.length === 0) return null

    return (
        <ParallaxSection
            id="stats"
            bgMedia={bgMedia ?? undefined}
            heightClass="min-h-[150vh]"
            badgeText={tagline || 'KEY PERFORMANCE METRICS'}
            title={title}
            contentMaxWidth="max-w-[1400px]"
        >
            <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full h-full">
                {stats.map((stat, index) => {
                    const isOpen = openIndex === index
                    return (
                        <button
                            key={stat.id}
                            type="button"
                            onClick={() => setOpenIndex(index)}
                            onMouseEnter={() => setOpenIndex(index)}
                            aria-expanded={isOpen}
                            className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out text-left flex ${
                                isOpen
                                    ? 'md:flex-[3] flex-[3] bg-primary/10 border-primary/40 shadow-lg shadow-primary/10'
                                    : 'md:flex-[1] flex-[1] bg-black/30 border-white/10 hover:border-primary/30'
                            }`}
                        >
                            <div className={`w-full flex ${isOpen ? 'md:flex-row flex-col' : 'md:flex-col flex-row'} items-stretch h-full`}>
                                <div className={`shrink-0 flex items-center justify-center px-4 py-4 md:py-6 ${isOpen ? '' : 'md:h-full'}`}>
                                    <span
                                        className={`text-foreground/70 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] whitespace-nowrap transition-all ${
                                            isOpen
                                                ? 'text-primary'
                                                : 'md:[writing-mode:vertical-rl] md:rotate-180'
                                        }`}
                                    >
                                        {stat.label}
                                    </span>
                                </div>
                                <div
                                    className={`flex-1 min-w-0 min-h-0 p-6 md:p-8 flex flex-col justify-center transition-opacity duration-300 ${
                                        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none hidden md:flex'
                                    }`}
                                >
                                    <div className="text-primary font-bold text-4xl sm:text-5xl md:text-6xl mb-3 tracking-tight">
                                        {isOpen ? <CountUp target={stat.value} /> : stat.value}
                                    </div>
                                    <div className="w-10 h-[2px] bg-primary/50 mb-4" />
                                    <p className="text-foreground/70 text-sm md:text-base leading-relaxed max-w-md">
                                        {stat.description || 'Delivering results through design-led engineering.'}
                                    </p>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </ParallaxSection>
    )
}


export default StatsSection
