"use client"

import React from 'react'
import { useSettings } from '@/hooks/use-settings'
import { useApi } from '@/hooks/use-api'
import { Pillar } from '@/types/api'
import ParallaxSection from '@/components/ParallaxSection'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'
import CarouselCard from '@/components/ui/CarouselCard'

const ValueProposition = () => {
    const { getSetting } = useSettings()
    const { data: pillars } = useApi<Pillar[]>('/pillars')

    const tagline = getSetting('vp_section_tagline') || 'THE APPROACH'
    const title = getSetting('vp_section_title')
    const subtitle = getSetting('vp_section_subtitle')

    const bgMedia = getSetting('bg_home_value_proposition')

    return (
        <ParallaxSection
            id="value-proposition"
            bgMedia={bgMedia}
            heightClass="min-h-[120vh]"
            badgeText={tagline}
            title={title}
            subtitle={subtitle}
            cta={{ label: 'Explore Our Approach', href: '/our-approach' }}
            contentMaxWidth="max-w-[1400px]"
        >
            <HorizontalCarousel className="h-full">
                {(pillars ?? []).map((p) => (
                    <CarouselCard
                        key={p.id}
                        title={p.title}
                        description={p.overview ?? undefined}
                        image={p.image || undefined}
                        href={`/our-approach/${p.slug}`}
                    />
                ))}
            </HorizontalCarousel>
        </ParallaxSection>
    )
}

export default ValueProposition
