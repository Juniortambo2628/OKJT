"use client"

import React from 'react'
import { useApi } from "@/hooks/use-api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ClientsSection from "@/components/sections/ClientsSection";
import CTABanner from "@/components/sections/CTABanner";
import PageHero from "@/components/PageHero"
import { usePageHeroMedia } from "@/hooks/use-page-hero-media"
import CaseStudiesPreview from "@/components/sections/CaseStudiesPreview";

export default function ClientImpactPage() {
    const { videoSrc, bgImage } = usePageHeroMedia({
        settingsKey: 'hero_client_impact_media',
        fallback: '/assets/videos/hero/01-energy.mp4'
    })

    return (
        <main className="flex min-h-screen flex-col relative bg-background">
            <Navbar />
            <PageHero 
                centered
                tagline="Client Impact"
                title="Results that build trust."
                subtitle="Delivering measurable results across global markets through strategic advisory and deep sector expertise."
                videoSrc={videoSrc}
                bgImage={bgImage}
            />
            <CaseStudiesPreview />
            <TestimonialsSection />
            <ClientsSection />
            <CTABanner />
            <Footer />
        </main>
    );
}

