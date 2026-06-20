"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import { usePageHeroMedia } from '@/hooks/use-page-hero-media'
import { motion } from 'framer-motion'
import { ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import ViewToggle, { ViewMode } from '@/components/ViewToggle'
import SkeletonCard from '@/components/SkeletonCard'

import { CaseStudy } from '@/types/api'

export default function PortfolioPage() {
    const { data: caseStudies, isLoading } = useApi<CaseStudy[]>('/case-studies')
    const [viewMode, setViewMode] = React.useState<ViewMode>('grid')

    const { videoSrc, bgImage, mediaLoading } = usePageHeroMedia({
        settingsKey: 'hero_case_studies_media',
    })

    const categories = React.useMemo(() => {
        if (!caseStudies) return ['All']
        const cats = new Set(caseStudies.map((cs) => cs.category).filter(Boolean))
        return ['All', ...Array.from(cats) as string[]]
    }, [caseStudies])
    const [activeCategory, setActiveCategory] = React.useState('All')

    const filtered = activeCategory === 'All'
        ? caseStudies
        : caseStudies?.filter((cs) => cs.category === activeCategory)

    return (
        <main className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <PageHero
                centered
                tagline="Engineering Excellence"
                title="Design-led web <br />engineering for impact."
                subtitle="High-performance software and digital engineering with measurable outcomes. Explore our portfolio of technical success."
                videoSrc={videoSrc}
                bgImage={bgImage}
                mediaLoading={mediaLoading}
            />

            {/* Case Study Grid */}
            <section className="py-24 bg-secondary/20">
                <div className="max-w-[1400px] mx-auto px-6">
                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16 pb-6 border-b border-border/50">
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 transition-all rounded-lg border ${
                                        activeCategory === cat
                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                            : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-border/80'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <ViewToggle mode={viewMode} onChange={setViewMode} label="View Mode" />
                    </div>

                    {isLoading && <SkeletonCard variant={viewMode} count={4} />}

                    {!isLoading && (!filtered || filtered.length === 0) && (
                        <div className="text-center py-40 text-muted-foreground/30 border-2 border-dashed border-border rounded-2xl">
                            <p className="text-xl font-medium text-foreground/50">Our portfolio is currently being expanded.</p>
                            <p className="text-sm mt-2">Check back soon for our latest client success stories.</p>
                        </div>
                    )}

                    <div className={cn(
                        "grid gap-12",
                        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    )}>
                        {filtered?.map((cs, index: number) => (
                            <motion.div
                                key={cs.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                            >
                                <Link href={`/portfolio/${cs.slug}`} className="block group">
                                    <div className={cn(
                                        "relative overflow-hidden bg-card border border-border/50 group-hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-2xl",
                                        viewMode === 'grid' ? "aspect-[16/10]" : "flex flex-col md:flex-row md:h-80"
                                    )}>
                                        {/* Background Image / Side Image */}
                                        {cs.image && (
                                            <div className={cn(
                                                "relative z-0 overflow-hidden shrink-0",
                                                viewMode === 'grid' ? "absolute inset-0" : "h-64 md:h-full md:w-[45%]"
                                            )}>
                                                <Image
                                                    src={cs.image}
                                                    alt={cs.title}
                                                    fill
                                                    className="object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                                                />
                                                <div className={cn(
                                                    "absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent",
                                                    viewMode === 'list' && "md:bg-gradient-to-r"
                                                )} />
                                            </div>
                                        )}

                                        {/* Content Overlay / Side Content */}
                                        <div className={cn(
                                            "z-10 relative flex flex-col justify-end",
                                            viewMode === 'grid' ? "absolute inset-0 p-8 md:p-12" : "flex-1 p-8 md:p-10"
                                        )}>
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div>
                                                    {cs.client_name && (
                                                        <span className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2 block">
                                                            {cs.client_name}
                                                        </span>
                                                    )}
                                                    <h3 className={cn(
                                                        "font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors",
                                                        viewMode === 'grid' ? "text-2xl md:text-3xl" : "text-2xl"
                                                    )}>
                                                        {cs.title}
                                                    </h3>
                                                </div>

                                                {/* Significant Figure Tooltip */}
                                                {cs.significant_figure && (
                                                    <div className="bg-background/60 backdrop-blur-md border border-border p-3 flex flex-col items-center justify-center min-w-[100px] shrink-0 shadow-xl">
                                                        <span className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest mb-1">Impact</span>
                                                        <span className="text-sm text-primary font-mono font-bold">{cs.significant_figure}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="max-w-md">
                                                {cs.problem && (
                                                    <p className={cn(
                                                        "text-muted-foreground text-sm leading-relaxed mb-6 group-hover:text-foreground/80 transition-colors",
                                                        viewMode === 'grid' ? "line-clamp-2" : "line-clamp-3"
                                                    )}>
                                                        {cs.problem.replace(/<[^>]*>?/gm, '')}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-6">
                                                    <span className="text-foreground font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:text-primary transition-colors">
                                                        View Project Details
                                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                                                    </span>
                                                    
                                                    {cs.category && (
                                                        <span className="px-3 py-1 bg-secondary/50 border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                            {cs.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Decorative Corner */}
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
