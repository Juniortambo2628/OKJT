"use client"

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { ExternalLink, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Project } from '@/types/api'
import SkeletonCard from '@/components/SkeletonCard'
import { getMediaUrl } from '@/lib/utils'
import ParallaxSection from '@/components/ParallaxSection'
import BaseLayout from '@/components/BaseLayout'
import PrimaryButton from '@/components/PrimaryButton'
import { usePageHeroMedia } from '@/hooks/use-page-hero-media'
import { type NavSection } from '@/lib/nav-sections'

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

    const navSections = React.useMemo<NavSection[]>(() => {
        const sections: NavSection[] = [{ id: 'hero', label: 'Intro' }]
        featured.forEach((item, index) => {
            sections.push({
                id: `project-${index}`,
                label: item.title.split(' ')[0]
            })
        })
        return sections
    }, [featured])

    return (
        <BaseLayout
            navSections={navSections}
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
            {isLoading && (
                <section className="py-24 bg-background">
                    <div className="max-w-[1400px] mx-auto px-6">
                        <SkeletonCard variant="grid" count={2} />
                    </div>
                </section>
            )}

            {!isLoading && featured.length === 0 && (
                <section className="py-24 bg-background">
                    <div className="max-w-[1400px] mx-auto px-6 text-center py-40 border border-white/5 rounded-3xl bg-black/40 backdrop-blur-md">
                        <p className="text-white/60 text-xl">
                            {isFlagship
                                ? 'Our flagship projects are currently being synchronized.'
                                : 'Our client portfolio is currently being synchronized.'
                            }
                        </p>
                    </div>
                </section>
            )}

            <div className="relative w-full bg-black overflow-visible">
                {featured.map((item, index) => (
                    <ParallaxSection
                        key={item.id}
                        id={`project-${index}`}
                        bgMedia={item.image ? getMediaUrl(item.image) : undefined}
                        heightClass="min-h-[220vh]"
                        contentMaxWidth="max-w-[1400px]"
                        className="text-center md:text-left"
                    >
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    {item.is_featured && (
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-primary/20">
                                            <Star size={10} className="fill-primary" /> Featured
                                        </span>
                                    )}
                                    <span className="text-primary font-mono text-xs font-bold uppercase tracking-[0.3em]">
                                        {isFlagship ? 'Flagship Innovation' : 'Client Project'}
                                    </span>
                                </div>
                                <span className="text-white/20 font-bold font-mono text-2xl hidden md:inline">0{index + 1}</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                                {item.title}
                            </h2>

                            {item.tagline && (
                                <p className="text-lg md:text-xl font-bold text-primary/80 italic">
                                    "{item.tagline}"
                                </p>
                            )}

                            <div
                                className="text-white/70 text-sm md:text-base leading-relaxed prose prose-invert max-w-none text-center md:text-left prose-p:leading-relaxed prose-p:text-white/70"
                                dangerouslySetInnerHTML={{ __html: item.description || '' }}
                            />

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-6">
                                {item.url && (
                                    <PrimaryButton
                                        href={item.url}
                                        size="lg"
                                        showArrow={false}
                                        className="bg-primary hover:bg-primary/90 text-[#14110b] font-bold h-14 px-8 rounded-none transition-all hover:scale-105 active:scale-95"
                                    >
                                        Launch Product <ExternalLink size={18} />
                                    </PrimaryButton>
                                )}
                                <PrimaryButton
                                    href={`/projects/${item.slug}`}
                                    variant="ghost"
                                    showArrow={false}
                                    className="text-white hover:text-primary p-0 h-auto font-bold uppercase tracking-widest text-xs"
                                >
                                    Full Case Study
                                    <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-2" />
                                </PrimaryButton>
                            </div>
                        </div>
                    </ParallaxSection>
                ))}
            </div>
        </BaseLayout>
    )
}
