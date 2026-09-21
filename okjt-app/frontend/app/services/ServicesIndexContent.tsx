"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import { Service } from '@/types/api'
import { useSettings } from '@/hooks/use-settings'
import { usePageHeroMedia } from '@/hooks/use-page-hero-media'
import BaseLayout from '@/components/BaseLayout'
import ParallaxSection from '@/components/ParallaxSection'
import CarouselCard from '@/components/ui/CarouselCard'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'
import { SectionSkeleton } from '@/components/MediaSkeleton'

export default function ServicesIndexContent() {
    const { getSetting, isLoading: settingsLoading } = useSettings()
    const { videoSrc, bgImage, mediaLoading } = usePageHeroMedia({ settingsKey: 'hero_services_media' })
    const heroMedia = videoSrc ?? bgImage
    const { data: services, isLoading } = useApi<Service[]>('/services')

    const servicesTitle = getSetting('services_title', 'Web applications, designed and built end to end.')
    const servicesSubtitle = getSetting('services_subtitle', 'Each service covers a part of the same journey: shaping the idea, designing the experience, building the platform and keeping it running well.')

    const navSections = React.useMemo(() => [
        { id: 'hero', label: 'Intro' },
        { id: 'services-list', label: 'Services' },
    ], [])

    return (
        <BaseLayout
            navSections={navSections}
            heroMedia={heroMedia}
            tagline="Services"
            title={servicesTitle}
            subtitle={servicesSubtitle}
            cta={{ label: 'Start a Project', href: '/contact' }}
            loading={settingsLoading || mediaLoading}
        >
            <ParallaxSection
                id="services-list"
                badgeText="Services"
                title="Explore the services"
                subtitle="Capabilities across web engineering, interface design and technical strategy."
                cta={{ label: 'Start a Project', href: '/contact' }}
                heightClass="min-h-[125vh]"
                contentMaxWidth="max-w-[1400px]"
            >
                {isLoading ? (
                    <SectionSkeleton />
                ) : (
                    <HorizontalCarousel className="h-full">
                        {services?.map((service) => (
                            <CarouselCard
                                key={service.id}
                                title={service.title}
                                description={service.description}
                                image={service.image}
                                href={`/services/${service.slug}`}
                            />
                        ))}
                    </HorizontalCarousel>
                )}
            </ParallaxSection>
        </BaseLayout>
    )
}
