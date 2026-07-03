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

export default function ProjectsContent() {
    const searchParams = useSearchParams()
    const typeFilter = searchParams.get('type') as 'client' | 'flagship' | null

    const { data: projects, isLoading } = useApi<Project[]>('/projects')
    const { videoSrc, bgImage } = usePageHeroMedia({ settingsKey: 'hero_projects_media' })
    const heroMedia = videoSrc ?? bgImage

    const featured = React.useMemo(() => {
        if (!projects) return []
        if (typeFilter) {
            return projects.filter(p => p.type === typeFilter && p.is_active)
        }
        return projects.filter(p => p.type === 'flagship' && p.is_active)
    }, [projects, typeFilter])

    const isFlagship = !typeFilter || typeFilter === 'flagship'

    return (
        <BaseLayout
            navSections={[
                { id: 'hero', label: 'Intro' },
                { id: 'projects-list', label: isFlagship ? 'Flagship' : 'Client Work' },
            ]}
            heroMedia={heroMedia}
            tagline={isFlagship ? 'Flagship Innovations' : 'Client Portfolio'}
            title={isFlagship
                ? "Engineering the <br />Future of Digital."
                : "Delivering Results <br />For Our Clients."
            }
            subtitle={isFlagship
                ? "Explore our bespoke flagship projects—highly specialized digital products built for scale, performance, and maximum impact."
                : "A curated selection of client engagements—tailored digital solutions that drive real business outcomes."
            }
        >
            <ParallaxSection
                id="projects-list"
                badgeText={isFlagship ? 'Flagship Work' : 'Client Work'}
                title={isFlagship ? 'Flagship Projects' : 'Client Projects'}
                subtitle={isFlagship
                    ? 'Bespoke digital products built for scale and impact.'
                    : 'Tailored solutions that drive real business outcomes.'
                }
                cta={{ label: 'View All Work', href: '/projects' }}
                heightClass="min-h-[230vh]"
                contentMaxWidth="max-w-[1400px]"
            >
                {isLoading ? (
                    <SectionSkeleton />
                ) : featured.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-white/60 text-xl">
                        {isFlagship
                            ? 'Our flagship projects are currently being synchronized.'
                            : 'Our client portfolio is currently being synchronized.'
                        }
                    </div>
                ) : (
                    <HorizontalCarousel className="h-full">
                        {featured.map((item) => (
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
        </BaseLayout>
    )
}
