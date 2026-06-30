"use client"

import React from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/use-api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import { motion } from 'framer-motion'
import { ExternalLink, ArrowRight, Star } from 'lucide-react'
import Image from 'next/image'
import { Project } from '@/types/api'
import SkeletonCard from '@/components/SkeletonCard'
import { Button } from '@/components/ui/button'
import { getMediaUrl } from '@/lib/utils'
import ParallaxSection from '@/components/ParallaxSection'
import ParallaxNav from '@/components/ParallaxNav'
import { SectionCard } from '@/components/ui/SectionCard'

export default function ProjectsContent() {
    const { data: projects, isLoading } = useApi<Project[]>('/projects')
    
    const featured = projects?.filter(p => p.type === 'flagship' && p.is_active) || []

    const navSections = React.useMemo(() => {
        const sections = [{ id: 'hero', label: 'Intro' }]
        featured.forEach((item, index) => {
            sections.push({
                id: `project-${index}`,
                label: item.title.split(' ')[0] // first word of title
            })
        })
        return sections
    }, [featured])

    return (
        <main className="flex min-h-screen flex-col bg-background w-full overflow-x-clip">
            <Navbar />

            <PageHero
                id="hero"
                centered
                tagline="Flagship Innovations"
                title="Engineering the <br />Future of Digital."
                subtitle="Explore our bespoke flagship projects—highly specialized digital products built for scale, performance, and maximum impact."
            />

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
                        <p className="text-white/60 text-xl">Our flagship projects are currently being synchronized.</p>
                    </div>
                </section>
            )}

            <div className="relative w-full bg-black overflow-visible">
                {featured.map((item, index) => (
                    <ParallaxSection
                        key={item.id}
                        id={`project-${index}`}
                        bgMedia={item.image ? getMediaUrl(item.image) : "/assets/videos/services/all-services-video.mp4"}
                        heightClass="min-h-[220vh]"
                        contentMaxWidth="max-w-[1400px]"
                    >
                        <SectionCard className="text-center md:text-left">
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        {item.is_featured && (
                                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-primary/20">
                                                <Star size={10} className="fill-primary" /> Featured
                                            </span>
                                        )}
                                        <span className="text-primary font-mono text-xs font-bold uppercase tracking-[0.3em]">Flagship Innovation</span>
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
                                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-[#14110b] font-bold h-14 px-8 rounded-none transition-all hover:scale-105 active:scale-95" asChild>
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                Launch Product <ExternalLink size={18} />
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="link" className="text-white hover:text-primary p-0 h-auto font-bold uppercase tracking-widest text-xs group" asChild>
                                        <Link href={`/projects/${item.slug}`}>
                                            Full Case Study
                                            <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </SectionCard>
                    </ParallaxSection>
                ))}
            </div>

            <ParallaxNav sections={navSections} />
            <Footer />
        </main>
    )
}
