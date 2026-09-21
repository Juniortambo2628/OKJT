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
import PrimaryButton from '@/components/PrimaryButton'

export default function FlagshipProjectsContent() {
    const { data: projects, isLoading } = useApi<Project[]>('/projects')
    const { videoSrc, bgImage } = usePageHeroMedia({ settingsKey: 'hero_projects_media' })
    const heroMedia = videoSrc ?? bgImage

    const flagshipProjects = React.useMemo(() => {
        if (!projects) return []
        return projects.filter(p => p.type === 'flagship' && p.is_active)
    }, [projects])

    const navSections = [
        { id: 'hero', label: 'Intro' },
        { id: 'flagship-projects', label: 'Flagship' },
        { id: 'process', label: 'Methodology' },
    ]

    return (
        <BaseLayout
            navSections={navSections}
            heroMedia={heroMedia}
            tagline="Flagship Work"
            title="Products built <br />from the ground up."
            subtitle="Flagship products developed by OKJTechnologies, each designed around a whole ecosystem of users and partners."
        >
            {/* Flagship Projects Section */}
            <ParallaxSection
                id="flagship-projects"
                badgeText="FLAGSHIP WORK"
                title="Flagship Projects"
                subtitle="Products developed and owned by OKJTechnologies."
                heightClass="min-h-[140vh]"
                contentMaxWidth="max-w-[1400px]"
            >
                {isLoading ? (
                    <SectionSkeleton />
                ) : flagshipProjects.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-white/60 text-xl">
                        Flagship projects are loading.
                    </div>
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

            {/* Methodology Section */}
            <ParallaxSection
                id="process"
                badgeText="METHOD"
                title="How flagship products are built"
                subtitle="Three stages that keep each product tied to the people it serves."
                heightClass="min-h-[120vh]"
                contentMaxWidth="max-w-[1400px]"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-black/20 p-8 border border-white/5 hover:border-primary/40 rounded-2xl transition-all">
                        <div className="text-primary font-bold text-xl mb-4">01. Mapping</div>
                        <h3 className="text-white text-lg font-bold mb-3">Ecosystem mapping</h3>
                        <p className="text-white/60 text-sm leading-relaxed">Everyone the product will touch is mapped first: users, partners, regulators and the community. The first release is scoped around what each of them needs.</p>
                    </div>
                    <div className="bg-black/20 p-8 border border-white/5 hover:border-primary/40 rounded-2xl transition-all">
                        <div className="text-primary font-bold text-xl mb-4">02. Building</div>
                        <h3 className="text-white text-lg font-bold mb-3">Short build cycles</h3>
                        <p className="text-white/60 text-sm leading-relaxed">The product is built in short cycles, each ending with a working version that can be tested. Feedback from each cycle shapes the next.</p>
                    </div>
                    <div className="bg-black/20 p-8 border border-white/5 hover:border-primary/40 rounded-2xl transition-all">
                        <div className="text-primary font-bold text-xl mb-4">03. Growing</div>
                        <h3 className="text-white text-lg font-bold mb-3">Launch and growth</h3>
                        <p className="text-white/60 text-sm leading-relaxed">After launch, usage and performance are monitored, and the platform is refined and extended as more people adopt it.</p>
                    </div>
                </div>
                <div className="mt-16 text-center">
                    <PrimaryButton href="/contact" size="lg" className="px-12 h-14" showArrow>
                        Discuss Your Next Project
                    </PrimaryButton>
                </div>
            </ParallaxSection>
        </BaseLayout>
    )
}
