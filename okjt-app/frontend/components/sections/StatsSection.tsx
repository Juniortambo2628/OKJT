"use client"

import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useApi } from '@/hooks/use-api'
import { getMediaUrl, cn } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'
import { SiteSetting, Stat } from '@/types/api'
import ParallaxSection from '@/components/ParallaxSection'
import { SectionCard } from '@/components/ui/SectionCard'

function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null)
    const isInView = useInView(ref, { once: true })
    const [count, setCount] = useState(0)

    const numericValue = parseInt(target.replace(/[^0-9]/g, ''), 10)

    useEffect(() => {
        if (!isInView || isNaN(numericValue)) return
        let start = 0
        const step = Math.max(1, Math.floor(numericValue / 60))
        const timer = setInterval(() => {
            start += step
            if (start >= numericValue) {
                setCount(numericValue)
                clearInterval(timer)
            } else {
                setCount(start)
            }
        }, 25)
        return () => clearInterval(timer)
    }, [isInView, numericValue])

    const prefix = target.match(/^[^0-9]*/)?.[0] || ''
    const originalSuffix = target.match(/[^0-9]*$/)?.[0] || suffix

    return (
        <span ref={ref}>
            {prefix}{isInView ? count.toLocaleString() : '0'}{originalSuffix}
        </span>
    )
}

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
                        <motion.div
                            key={stat.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15 }}
                            className="text-center p-6 md:p-10 relative group"
                        >
                            {/* Hover glow */}
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-500" />

                            <div className="relative z-10">
                                <div className="text-primary font-bold text-4xl sm:text-5xl md:text-6xl mb-4 tracking-tight">
                                    <AnimatedCounter target={stat.value} />
                                </div>
                                <div className="w-8 h-[2px] bg-primary/40 mx-auto mb-4" />
                                <div className="text-foreground text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-3">
                                    {stat.label}
                                </div>
                                <div className="text-foreground/60 text-xs max-w-[200px] mx-auto leading-relaxed">
                                    {stat.description || 'Delivering results through design-led engineering.'}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </SectionCard>
        </ParallaxSection>
    )
}


export default StatsSection
