"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Code2, Palette, LineChart } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'
import ParallaxSection from '@/components/ParallaxSection'
import FadeIn from '@/components/animations/FadeIn'

const ValueProposition = () => {
    const { getSetting } = useSettings()

    const tagline = getSetting('vp_section_tagline') || "VALUE PROPOSITION"
    const title = getSetting('vp_section_title')
    const subtitle = getSetting('vp_section_subtitle')

    const pillars = useMemo(() => [
        {
            title: getSetting('vp_pillar1_title') || 'Technology',
            description: getSetting('vp_pillar1_description'),
            icon: Code2,
            href: '/services',
            stats: getSetting('vp_pillar1_stats'),
            tag: getSetting('vp_pillar1_tag'),
        },
        {
            title: getSetting('vp_pillar2_title') || 'Design',
            description: getSetting('vp_pillar2_description'),
            icon: Palette,
            href: '/services',
            stats: getSetting('vp_pillar2_stats'),
            tag: getSetting('vp_pillar2_tag'),
        },
        {
            title: getSetting('vp_pillar3_title') || 'Strategy',
            description: getSetting('vp_pillar3_description'),
            icon: LineChart,
            href: '/services',
            stats: getSetting('vp_pillar3_stats'),
            tag: getSetting('vp_pillar3_tag'),
        },
    ], [getSetting])

    const bgMedia = getSetting('bg_home_value_proposition')

    return (
        <ParallaxSection
            id="value-proposition"
            bgMedia={bgMedia}
            heightClass="min-h-[130vh]"
            badgeText={tagline}
            title={title}
            subtitle={subtitle}
            contentMaxWidth="max-w-[1400px]"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {pillars.map((pillar, index) => {
                    const Icon = pillar.icon
                    return (
                        <FadeIn key={pillar.title} direction="up" distance={24} delay={index * 0.1}>
                            <Link
                                href={pillar.href}
                                className="group block h-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-primary/40 hover:bg-white/[0.06] transition-all duration-300"
                            >
                                <Icon className="h-10 w-10 text-primary mb-5 drop-shadow-lg" />
                                {pillar.tag && (
                                    <span className="inline-block px-3 py-1 rounded-full bg-foreground/10 border border-foreground/10 text-foreground/80 text-[10px] font-bold uppercase tracking-widest mb-4">
                                        {pillar.tag}
                                    </span>
                                )}
                                <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                    {pillar.title}
                                </h3>
                                <p className="text-foreground/60 text-sm leading-relaxed mb-6">
                                    {pillar.description}
                                </p>
                                {pillar.stats && (
                                    <div className="text-primary font-bold text-lg mb-6">
                                        {pillar.stats}
                                    </div>
                                )}
                                <div className="mt-auto inline-flex items-center gap-2 text-foreground/70 font-bold uppercase tracking-wider text-xs group-hover:text-primary transition-colors">
                                    Learn More
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        </FadeIn>
                    )
                })}
            </div>
        </ParallaxSection>
    )
}

export default ValueProposition
