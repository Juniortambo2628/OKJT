"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import { Insight } from '@/types/api'
import { useSettings } from '@/hooks/use-settings'
import { usePageHeroMedia } from '@/hooks/use-page-hero-media'
import BaseLayout from '@/components/BaseLayout'
import ParallaxSection from '@/components/ParallaxSection'
import CarouselCard from '@/components/ui/CarouselCard'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'
import { SectionSkeleton } from '@/components/MediaSkeleton'

export default function InsightsContent() {
    const { getSetting, isLoading: settingsLoading } = useSettings()
    const { videoSrc, bgImage, mediaLoading } = usePageHeroMedia({ settingsKey: 'hero_insights_media' })
    const heroMedia = videoSrc ?? bgImage
    const { data: insights, isLoading } = useApi<Insight[]>('/insights')

    const title = getSetting('insights_title', 'Insights & Research')
    const subtitle = getSetting('insights_subtitle', 'Analysis, commentary, and research from our team on the trends shaping web development, design, and digital strategy.')

    return (
        <BaseLayout
            navSections={[
                { id: 'hero', label: 'Intro' },
                { id: 'insights-list', label: 'Articles' },
            ]}
            heroMedia={heroMedia}
            tagline="Thought Leadership"
            title={title}
            subtitle={subtitle}
            loading={settingsLoading || mediaLoading}
        >
            <ParallaxSection
                id="insights-list"
                badgeText="Latest Articles"
                title="Insights & Research"
                subtitle="Analysis and commentary from our team on the trends shaping digital."
                cta={{ label: 'Subscribe', href: '/contact' }}
                heightClass="min-h-[230vh]"
                contentMaxWidth="max-w-[1400px]"
            >
                {isLoading ? (
                    <SectionSkeleton />
                ) : (
                    <HorizontalCarousel className="h-full">
                        {insights?.map((insight) => (
                            <CarouselCard
                                key={insight.id}
                                title={insight.title}
                                description={(insight.excerpt || insight.content || '').replace(/<[^>]*>?/gm, '').substring(0, 140)}
                                image={insight.image}
                                href={`/insights/${insight.slug}`}
                            />
                        ))}
                    </HorizontalCarousel>
                )}
            </ParallaxSection>
        </BaseLayout>
    )
}
