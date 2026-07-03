"use client"

import React, { useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SectionSkeleton } from '@/components/MediaSkeleton'
import { useSettings } from '@/hooks/use-settings'
import { Insight } from '@/types/api'
import ParallaxSection from '@/components/ParallaxSection'
import CarouselCard from '@/components/ui/CarouselCard'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'
import FadeIn from '@/components/animations/FadeIn'

const InsightsSection = () => {
    const { data: insights, isLoading, isError } = useApi<Insight[]>('/insights')
    const { getSetting } = useSettings()
    const [activeTab, setActiveTab] = useState('Featured')
    const bgMedia = getSetting('bg_home_insights')

    if (isLoading) return <SectionSkeleton />
    if (isError || !insights || insights.length === 0) {
        return (
            <ParallaxSection
                id="insights"
                bgMedia={bgMedia}
                heightClass="min-h-[230vh]"
                badgeText="Technical Insights"
                title="Latest Articles & News"
            >
                <FadeIn className="w-full text-center bg-foreground/5 border border-foreground/10 rounded-[2rem] p-12" direction="up" distance={24} blur={false}>
                    <p className="text-foreground/60">The latest research notes and advisory updates will appear here as they are published.</p>
                </FadeIn>
            </ParallaxSection>
        )
    }

    const featured = activeTab === 'Featured' ? insights.slice(0, 6) : insights.slice(0, 6)
    const latest = activeTab === 'Latest' ? insights : insights.slice(6)
    const displayItems = activeTab === 'Featured' ? featured : latest

    return (
        <ParallaxSection
            id="insights"
            bgMedia={bgMedia}
            heightClass="min-h-[230vh]"
            contentMaxWidth="max-w-[1400px]"
            badgeText="Technical Insights"
            title="Latest Articles & News"
            toolbarTitle="Filter Insights"
            tabs={['Featured', 'Latest']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            <div className="flex flex-col h-full">
                <HorizontalCarousel className="flex-1 min-h-0">
                    {displayItems.map((insight) => (
                        <CarouselCard
                            key={insight.id}
                            title={insight.title}
                            description={(insight.excerpt || insight.content || '').replace(/<[^>]*>?/gm, '').substring(0, 160)}
                            image={insight.image}
                            href={`/insights/${insight.slug}`}
                        />
                    ))}
                </HorizontalCarousel>

                <FadeIn className="mt-6 flex-shrink-0" direction="up" distance={16} blur={false}>
                    <Link
                        href="/insights"
                        className="inline-flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider hover:text-primary transition-colors group"
                    >
                        View All Articles
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </FadeIn>
            </div>
        </ParallaxSection>
    )
}

export default InsightsSection
