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

    const servicesTitle = getSetting('services_title', 'Services that drive digital transformation.')
    const servicesSubtitle = getSetting('services_subtitle', 'From strategy to execution, we build high-performance software, interfaces, and platforms tailored to your business.')

    const navSections = React.useMemo(() => [
        { id: 'hero', label: 'Intro' },
        { id: 'services-list', label: 'Services' },
    ], [])

    return (
        <BaseLayout
            navSections={navSections}
            heroMedia={heroMedia}
            tagline="Our Services"
            title={servicesTitle}
            subtitle={servicesSubtitle}
            cta={{ label: 'View All Services', href: '/services' }}
            loading={settingsLoading || mediaLoading}
        >
            <ParallaxSection
                id="services-list"
                badgeText="What We Do"
                title="Explore our services"
                subtitle="Specialist capabilities across web engineering, design, and digital strategy."
                cta={{ label: 'Start a Project', href: '/contact' }}
                heightClass="min-h-[230vh]"
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
