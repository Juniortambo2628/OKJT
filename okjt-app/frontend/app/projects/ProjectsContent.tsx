"use client"

import React from 'react'
import { useSearchParams } from 'next/navigation'
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

export default function ProjectsContent() {
    const searchParams = useSearchParams()
    const typeFilter = searchParams.get('type') as 'client' | 'flagship' | null

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

    const showFlagship = !typeFilter || typeFilter === 'flagship'
    const showClient = !typeFilter || typeFilter === 'client'

    // Configure nav sections based on what's visible
    const navSections = [
        { id: 'hero', label: 'Intro' },
    ]
    if (showFlagship) navSections.push({ id: 'flagship-projects', label: 'Flagship' })
    if (showClient) navSections.push({ id: 'client-projects', label: 'Client Work' })
    navSections.push({ id: 'process', label: 'Methodology' })

    const title = typeFilter === 'flagship' 
        ? "Engineering the <br />Future of Digital." 
        : typeFilter === 'client' 
            ? "Delivering Results <br />For Our Clients."
            : "Transforming Ideas <br />Into Digital Reality."

    const subtitle = typeFilter === 'flagship'
        ? "Explore our bespoke flagship projects—highly specialized digital products built for scale, performance, and maximum impact."
        : typeFilter === 'client'
            ? "A curated selection of client engagements—tailored digital solutions that drive real business outcomes."
            : "Explore our complete portfolio, from highly specialized flagship products to tailored client solutions."

    return (
        <BaseLayout
            navSections={navSections}
            heroMedia={heroMedia}
            tagline="Our Portfolio"
            title={title}
            subtitle={subtitle}
        >
            {/* Flagship Projects Section */}
            {showFlagship && (
                <ParallaxSection
                    id="flagship-projects"
                    badgeText="FLAGSHIP WORK"
                    title="Flagship Projects"
                    subtitle="Bespoke digital products built for scale and impact."
                    heightClass="min-h-[200vh]"
                    contentMaxWidth="max-w-[1400px]"
                >
                    {isLoading ? (
                        <SectionSkeleton />
                    ) : flagshipProjects.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-white/60 text-xl">
                            Our flagship projects are currently being synchronized.
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
            )}

            {/* Client Projects Section */}
            {showClient && (
                <ParallaxSection
                    id="client-projects"
                    badgeText="CLIENT WORK"
                    title="Client Projects"
                    subtitle="Tailored solutions that drive real business outcomes."
                    heightClass="min-h-[200vh]"
                    contentMaxWidth="max-w-[1400px]"
                >
                    {isLoading ? (
                        <SectionSkeleton />
                    ) : clientProjects.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-white/60 text-xl">
                            Our client portfolio is currently being synchronized.
                        </div>
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

            {/* Added Methodology Section for the Landing Page */}
            <ParallaxSection
                id="process"
                badgeText="OUR METHODOLOGY"
                title="How We Deliver Excellence"
                subtitle="A rigorous, engineering-led approach to product development and digital transformation."
                heightClass="min-h-[170vh]"
                contentMaxWidth="max-w-[1400px]"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-black/20 p-8 border border-white/5 hover:border-primary/40 rounded-2xl transition-all">
                        <div className="text-primary font-bold text-xl mb-4">01. Discovery</div>
                        <h3 className="text-white text-lg font-bold mb-3">Strategic Alignment</h3>
                        <p className="text-white/60 text-sm leading-relaxed">We deep-dive into your business objectives, target audience, and technical constraints to architect a comprehensive roadmap.</p>
                    </div>
                    <div className="bg-black/20 p-8 border border-white/5 hover:border-primary/40 rounded-2xl transition-all">
                        <div className="text-primary font-bold text-xl mb-4">02. Execution</div>
                        <h3 className="text-white text-lg font-bold mb-3">Iterative Engineering</h3>
                        <p className="text-white/60 text-sm leading-relaxed">Our engineers and designers work in agile sprints, delivering testable features rapidly while ensuring code quality and scalability.</p>
                    </div>
                    <div className="bg-black/20 p-8 border border-white/5 hover:border-primary/40 rounded-2xl transition-all">
                        <div className="text-primary font-bold text-xl mb-4">03. Scale</div>
                        <h3 className="text-white text-lg font-bold mb-3">Optimization & Growth</h3>
                        <p className="text-white/60 text-sm leading-relaxed">Post-launch, we monitor analytics, optimize performance, and scale infrastructure to support your growing user base.</p>
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
