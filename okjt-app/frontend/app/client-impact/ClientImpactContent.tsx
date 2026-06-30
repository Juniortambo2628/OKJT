"use client"

import React from 'react'
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import TestimonialsSection from "@/components/sections/TestimonialsSection"
import ClientsSection from "@/components/sections/ClientsSection"
import CTABanner from "@/components/sections/CTABanner"
import PageHero from "@/components/PageHero"
import { usePageHeroMedia } from "@/hooks/use-page-hero-media"
import ProjectsPreview from "@/components/sections/ProjectsPreview"
import ParallaxSection from "@/components/ParallaxSection"
import ParallaxNav from "@/components/ParallaxNav"
import { SectionCard } from "@/components/ui/SectionCard"
import { useSettings } from "@/hooks/use-settings"

export default function ClientImpactContent() {
    const { videoSrc, bgImage } = usePageHeroMedia({
        settingsKey: 'hero_client_impact_media',
    })
    
    const { getSetting } = useSettings()
    
    const bgProjects = getSetting('bg_projects_featured', '/assets/videos/services/all-services-video.mp4')
    const bgTestimonials = getSetting('bg_client_impact_testimonials', '/assets/videos/services/all-services-video.mp4')
    const bgClients = getSetting('bg_client_impact_clients', '/assets/videos/services/all-services-video.mp4')

    const navSections = [
        { id: 'impact-hero', label: 'Intro' },
        { id: 'impact-projects', label: 'Projects' },
        { id: 'impact-testimonials', label: 'Testimonials' },
        { id: 'impact-clients', label: 'Clients' },
        { id: 'cta', label: 'Contact' },
    ]

    return (
        <main className="flex min-h-screen flex-col relative bg-background w-full overflow-x-clip">
            <Navbar />
            <PageHero 
                id="impact-hero"
                centered
                tagline="Client Impact"
                title="Results that build trust."
                subtitle="Delivering measurable results across global markets through strategic advisory and deep sector expertise."
                videoSrc={videoSrc}
                bgImage={bgImage}
            />

            <div className="relative bg-black w-full overflow-visible">
                {/* Projects Section wrapped in parallax */}
                <ParallaxSection
                    id="impact-projects"
                    bgMedia={bgProjects}
                    heightClass="min-h-[220vh]"
                    overlayOpacity={0.7}
                    contentMaxWidth="max-w-[1400px]"
                >
                    <SectionCard className="p-0 sm:p-0 md:p-0 overflow-hidden">
                        <div className="w-full pointer-events-auto h-full flex">
                            <ProjectsPreview />
                        </div>
                    </SectionCard>
                </ParallaxSection>

                {/* Testimonials Section wrapped in parallax */}
                <ParallaxSection
                    id="impact-testimonials"
                    bgMedia={bgTestimonials}
                    heightClass="min-h-[200vh]"
                    overlayOpacity={0.75}
                    contentMaxWidth="max-w-[1400px]"
                >
                    <SectionCard className="p-0 sm:p-0 md:p-0 overflow-hidden">
                        <div className="w-full pointer-events-auto h-full flex">
                            <TestimonialsSection />
                        </div>
                    </SectionCard>
                </ParallaxSection>

                {/* Clients Section wrapped in parallax */}
                <ParallaxSection
                    id="impact-clients"
                    bgMedia={bgClients}
                    heightClass="min-h-[170vh]"
                    overlayOpacity={0.7}
                    contentMaxWidth="max-w-[1400px]"
                >
                    <SectionCard className="p-0 sm:p-0 md:p-0 overflow-hidden bg-background/50">
                        <div className="w-full pointer-events-auto h-full flex">
                            <ClientsSection />
                        </div>
                    </SectionCard>
                </ParallaxSection>

                <CTABanner />
            </div>

            <ParallaxNav sections={navSections} />
            <Footer />
        </main>
    )
}
