"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import { Project } from '@/types/api'
import { getMediaUrl } from '@/lib/utils'
import BaseLayout from '@/components/BaseLayout'
import ParallaxSection from '@/components/ParallaxSection'
import CarouselCard from '@/components/ui/CarouselCard'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'
import { SectionSkeleton } from '@/components/MediaSkeleton'
import { usePageHeroMedia } from '@/hooks/use-page-hero-media'

export default function ProjectsContent() {
    const { data: projects, isLoading } = useApi<Project[]>('/projects')
    const { videoSrc, bgImage } = usePageHeroMedia({ settingsKey: 'hero_projects_media' })
    const heroMedia = videoSrc ?? bgImage

    const flagshipProjects = React.useMemo(() => {
        if (!projects) return []
        return projects.filter(p => p.type === 'flagship' && p.is_active)
    }, [projects])

    const clientProjects = React.useMemo(() => {
        if (!projects) return []
        return projects.filter(p => p.type === 'client' && p.is_active)
    }, [projects])

    const navSections = [
        { id: 'hero', label: 'Intro' },
        { id: 'flagship-projects', label: 'Flagship' },
        { id: 'client-projects', label: 'Client Work' },
    ]

    return (
        <BaseLayout
            navSections={navSections}
            heroMedia={heroMedia}
            tagline="Our Portfolio"
            title="Transforming Ideas <br />Into Digital Reality."
            subtitle="Explore our complete portfolio, from highly specialized flagship products to tailored client solutions."
        >
            {/* Flagship Projects Section */}
            {flagshipProjects.length > 0 && (
                <ParallaxSection
                    id="flagship-projects"
                    badgeText="FLAGSHIP WORK"
                    title="Flagship Projects"
                    subtitle="Bespoke digital products built for scale and impact."
                    heightClass="min-h-[140vh]"
                    contentMaxWidth="max-w-[1400px]"
                >
                    {isLoading ? (
                        <SectionSkeleton />
                    ) : (
                        <HorizontalCarousel className="h-full">
                            {flagshipProjects.map((item) => (
                                <CarouselCard
                                    key={item.id}
                                    title={item.title}
                                    description={item.tagline || item.description?.replace(/<[^>]*>?/gm, '').substring(0, 120)}
                                    image={item.image ? getMediaUrl(item.image) : undefined}
                                    href={`/projects/${item.slug}`}
                                />
                            ))}
                        </HorizontalCarousel>
                    )}
                </ParallaxSection>
            )}

            {/* Client Projects Section */}
            {clientProjects.length > 0 && (
                <ParallaxSection
                    id="client-projects"
                    badgeText="CLIENT WORK"
                    title="Client Projects"
                    subtitle="Tailored solutions that drive real business outcomes."
                    heightClass="min-h-[140vh]"
                    contentMaxWidth="max-w-[1400px]"
                >
                    {isLoading ? (
                        <SectionSkeleton />
                    ) : (
                        <HorizontalCarousel className="h-full">
                            {clientProjects.map((item) => (
                                <CarouselCard
                                    key={item.id}
                                    title={item.title}
                                    description={item.tagline || item.description?.replace(/<[^>]*>?/gm, '').substring(0, 120)}
                                    image={item.image ? getMediaUrl(item.image) : undefined}
                                    href={`/projects/${item.slug}`}
                                />
                            ))}
                        </HorizontalCarousel>
                    )}
                </ParallaxSection>
            )}

        </BaseLayout>
    )
}
