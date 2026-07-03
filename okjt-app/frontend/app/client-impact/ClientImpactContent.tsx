"use client"

import React from 'react'
import TestimonialsSection from "@/components/sections/TestimonialsSection"
import ClientsSection from "@/components/sections/ClientsSection"
import CTABanner from "@/components/sections/CTABanner"
import { usePageHeroMedia } from "@/hooks/use-page-hero-media"
import ProjectsPreview from "@/components/sections/ProjectsPreview"
import ParallaxSection from "@/components/ParallaxSection"
import { useSettings } from "@/hooks/use-settings"
import BaseLayout from '@/components/BaseLayout'
import { CLIENT_IMPACT_NAV_SECTIONS } from '@/lib/nav-sections'

export default function ClientImpactContent() {
    const { videoSrc, bgImage } = usePageHeroMedia({
        settingsKey: 'hero_client_impact_media',
    })
    const heroMedia = videoSrc ?? bgImage
    
    const { getSetting } = useSettings()
    
    const bgProjects = getSetting('bg_projects_featured')
    const bgTestimonials = getSetting('bg_client_impact_testimonials')
    const bgClients = getSetting('bg_client_impact_clients')

    return (
        <BaseLayout
            navSections={CLIENT_IMPACT_NAV_SECTIONS}
            heroMedia={heroMedia}
            tagline="Client Impact"
            title="Results that build trust."
            subtitle="Delivering measurable results across global markets through strategic advisory and deep sector expertise."
        >
            {/* Projects Section wrapped in parallax */}
            <ParallaxSection
                id="impact-projects"
                bgMedia={bgProjects}
                heightClass="min-h-[220vh]"
                overlayOpacity={0.7}
                contentMaxWidth="max-w-[1400px]"
                className="p-0 sm:p-0 md:p-0 overflow-hidden"
            >
                <div className="w-full pointer-events-auto h-full flex">
                    <ProjectsPreview />
                </div>
            </ParallaxSection>

            {/* Testimonials Section wrapped in parallax */}
            <ParallaxSection
                id="impact-testimonials"
                bgMedia={bgTestimonials}
                heightClass="min-h-[200vh]"
                overlayOpacity={0.75}
                contentMaxWidth="max-w-[1400px]"
                className="p-0 sm:p-0 md:p-0 overflow-hidden"
            >
                <div className="w-full pointer-events-auto h-full flex">
                    <TestimonialsSection />
                </div>
            </ParallaxSection>

            {/* Clients Section wrapped in parallax */}
            <ParallaxSection
                id="impact-clients"
                bgMedia={bgClients}
                heightClass="min-h-[170vh]"
                overlayOpacity={0.7}
                contentMaxWidth="max-w-[1400px]"
                className="p-0 sm:p-0 md:p-0 overflow-hidden bg-background/50"
            >
                <div className="w-full pointer-events-auto h-full flex">
                    <ClientsSection />
                </div>
            </ParallaxSection>

            <CTABanner />
        </BaseLayout>
    )
}
