"use client"

import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import ParallaxNav from '@/components/ParallaxNav'
import { cn } from '@/lib/utils'

import { NavSection } from '@/lib/nav-sections'

interface BreadcrumbItem {
    label: string
    href?: string
}

export interface BaseLayoutProps {
    children: React.ReactNode
    className?: string
    /** Unique hero background media for this page. Video or image URL. */
    heroMedia?: string
    /** Page tagline shown in the hero pill */
    tagline?: string
    /** Page title. Can include <br /> for line breaks. */
    title?: React.ReactNode
    /** Page subtitle/description */
    subtitle?: string
    /** Hero CTA. Set to null to hide. */
    cta?: { label: string; href: string } | null
    /** Inline breadcrumbs rendered inside the hero */
    breadcrumbs?: BreadcrumbItem[]
    /** Extra content rendered inside the hero after the CTA */
    heroChildren?: React.ReactNode
    /** Section list for the persistent jump toolbar */
    navSections?: NavSection[]
    /** Whether the page is still loading hero content */
    loading?: boolean
}

export default function BaseLayout({
    children,
    className,
    heroMedia,
    tagline,
    title,
    subtitle,
    cta,
    breadcrumbs,
    heroChildren,
    navSections,
    loading
}: BaseLayoutProps) {
    const isVideo = heroMedia?.endsWith('.mp4') || heroMedia?.endsWith('.webm')

    return (
        <main className={cn("flex min-h-screen flex-col bg-background w-full overflow-x-clip relative", className)}>
            <Navbar />

            {(title || tagline || subtitle || heroMedia) && (
                <Hero
                    tagline={tagline}
                    title={title}
                    subtitle={subtitle}
                    videos={isVideo && heroMedia ? [heroMedia] : undefined}
                    bgImage={!isVideo ? heroMedia : undefined}
                    cta={cta}
                    breadcrumbs={breadcrumbs}
                    loading={loading}
                >
                    {heroChildren}
                </Hero>
            )}

            <div className="relative bg-black w-full overflow-visible">
                {children}
            </div>

            {navSections && navSections.length > 1 && (
                <ParallaxNav sections={navSections} />
            )}

            <Footer />
        </main>
    )
}
