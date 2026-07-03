"use client"

import React, { useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSettings } from '@/hooks/use-settings'
import { Service } from '@/types/api'
import { SectionSkeleton } from '@/components/MediaSkeleton'
import ParallaxSection from '@/components/ParallaxSection'
import CarouselCard from '@/components/ui/CarouselCard'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'
import FadeIn from '@/components/animations/FadeIn'

const categories = ['All', 'Web Development', 'UI/UX Design', 'Digital Strategy']

const ServicesSection = () => {
    const { data: services, isLoading: servicesLoading, isError: servicesError } = useApi<Service[]>('/services')
    const { getSetting, isLoading: settingsLoading } = useSettings()

    const [activeCategory, setActiveCategory] = useState('All')

    const sectionTagline = getSetting('services_tagline')
    const sectionTitle = getSetting('services_title')

    const bgMedia = getSetting('bg_home_services')

    if (servicesLoading || settingsLoading) return <SectionSkeleton />
    if (servicesError) return null

    const filteredServices = activeCategory === 'All'
        ? services
        : services?.filter((s) => s.category === activeCategory)

    const seeAllHref = activeCategory === 'All' ? '/services' : `/services?category=${encodeURIComponent(activeCategory)}`

    return (
        <ParallaxSection
            id="services"
            bgMedia={bgMedia}
            heightClass="min-h-[230vh]"
            contentMaxWidth="max-w-[1400px]"
            badgeText={sectionTagline || "SERVICES"}
            title={sectionTitle}
            toolbarTitle="Categories"
            tabs={categories}
            activeTab={activeCategory}
            onTabChange={setActiveCategory}
        >
            <div className="flex flex-col h-full">
                <HorizontalCarousel className="flex-1 min-h-0">
                    {filteredServices?.map((service) => (
                        <CarouselCard
                            key={service.id}
                            title={service.title}
                            description={service.description}
                            image={service.image}
                            href={`/services/${service.slug}`}
                        />
                    ))}
                </HorizontalCarousel>

                <FadeIn className="mt-6 flex-shrink-0" direction="up" distance={16} blur={false}>
                    <Link
                        href={seeAllHref}
                        className="inline-flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider hover:text-primary transition-colors group"
                    >
                        View All Services
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </FadeIn>

                {(!filteredServices || filteredServices.length === 0) && (
                    <FadeIn className="py-20 text-center text-foreground/30 border border-dashed border-foreground/10 rounded-xl" direction="up" distance={16} blur={false}>
                        No services available in this category yet.
                    </FadeIn>
                )}
            </div>
        </ParallaxSection>
    )
}

export default ServicesSection
