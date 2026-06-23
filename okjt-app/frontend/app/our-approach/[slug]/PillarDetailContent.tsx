"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import { useSettings } from '@/hooks/use-settings'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import { SectionSkeleton } from '@/components/MediaSkeleton'

export default function PillarDetailContent({ slug }: { slug: string }) {
    const { getSetting } = useSettings()
    const { data: pillar, isLoading } = useApi(`/pillars/${slug}`)

    const heroMedia = React.useMemo(() => {
        if (!pillar) return ''
        const key = `hero_pillar_${pillar.slug?.replace(/-/g, '_')}`
        return getSetting(key) || pillar.image
    }, [pillar, getSetting])

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background">
                <Navbar />
                <SectionSkeleton />
                <Footer />
            </main>
        )
    }

    if (!pillar) return <div className="min-h-screen bg-background flex items-center justify-center">Pillar not found</div>

    return (
        <main className="flex min-h-screen flex-col bg-background">
            <Navbar />
            
            <PageHero 
                tagline="OKJTech Innovation"
                title={pillar.title}
                subtitle={pillar.overview || ''}
                breadcrumbs={[
                    { label: 'Our Approach', href: '/our-approach' },
                    { label: pillar.title }
                ]}
                videoSrc={heroMedia?.endsWith('.mp4') ? heroMedia : undefined}
                bgImage={heroMedia && !heroMedia.endsWith('.mp4') ? heroMedia : undefined}
            />

            {/* Pillar Content */}
            <section className="py-24 bg-background relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                    <Link 
                        href="/projects" 
                        className="inline-flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-widest mb-12 hover:gap-3 transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Portfolio
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-16 mb-32">
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="prose prose-invert lg:prose-xl max-w-none"
                            >
                                <div 
                                    className="text-muted-foreground leading-relaxed text-lg prose-p:leading-relaxed prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-muted-foreground"
                                    dangerouslySetInnerHTML={{ __html: pillar.content || pillar.overview || '' }} 
                                />
                            </motion.div>
                        </div>
                    </div>

                    <div className="space-y-16">
                        <div className="text-center max-w-3xl mx-auto space-y-4">
                            <h2 className="text-4xl font-bold text-foreground tracking-tight">Technical Specifications & Services</h2>
                            <p className="text-muted-foreground text-lg">
                                Detailed breakdown of the technologies and services involved in this innovation.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {pillar.services?.map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={`/services/${service.slug}`}
                                        className="group relative h-full bg-secondary/5 p-8 border border-border/50 hover:border-primary/40 transition-all flex flex-col justify-between overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                                        
                                        <div className="relative z-10">
                                            <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                                                {service.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-8">
                                                {service.description}
                                            </p>
                                        </div>
                                        
                                        <div className="relative z-10 pt-4 border-t border-border/30 flex items-center justify-between group-hover:border-primary/20 transition-colors">
                                            <span className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                                                View Details
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-2" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {(!pillar.services || pillar.services.length === 0) && (
                            <div className="text-center py-24 border-2 border-dashed border-border/50 rounded-xl bg-secondary/5">
                                <p className="text-muted-foreground italic font-medium">Focused services for this pillar are currently being finalised.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
