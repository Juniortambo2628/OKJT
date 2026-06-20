"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import { useSettings } from '@/hooks/use-settings'
import { usePageHeroMedia } from '@/hooks/use-page-hero-media'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import ViewToggle, { ViewMode } from '@/components/ViewToggle'
import SkeletonCard from '@/components/SkeletonCard'

import { Insight } from '@/types/api'

export default function InsightsPage() {
    const { isLoading: settingsLoading } = useSettings()
    const { videoSrc, bgImage, mediaLoading } = usePageHeroMedia({ settingsKey: 'hero_insights_media' })
    const { data: insights, isLoading } = useApi<Insight[]>('/insights')
    const [viewMode, setViewMode] = React.useState<ViewMode>('grid')

    const categories = React.useMemo(() => {
        if (!insights) return ['All']
        const cats = new Set(insights.map((ins) => ins.category).filter(Boolean))
        return ['All', ...Array.from(cats) as string[]]
    }, [insights])
    const [activeCategory, setActiveCategory] = React.useState('All')

    const filtered = activeCategory === 'All'
        ? insights
        : insights?.filter((ins) =>
            ins.category?.toLowerCase() === activeCategory.toLowerCase()
        )

    return (
        <main className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <PageHero
                centered
                tagline="Thought Leadership"
                title="Insights &amp; Research"
                subtitle="Analysis, commentary, and research from our advisory team on the trends shaping energy, fintech, and global markets."
                videoSrc={videoSrc}
                bgImage={bgImage}
                mediaLoading={mediaLoading}
                contentLoading={settingsLoading}
            />

            {/* Insights Grid */}
            <section className="py-24 bg-secondary/20 min-h-screen">
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

                        <ViewToggle mode={viewMode} onChange={setViewMode} label="Layout" />
                    </div>

                    {isLoading && <SkeletonCard variant={viewMode} count={6} />}

                    {!isLoading && (!filtered || filtered.length === 0) && (
                        <div className="text-center py-20 text-muted-foreground/30 border-2 border-dashed border-border rounded-2xl">
                            No insights available yet. Check back soon.
                        </div>
                    )}

                    <div className={cn(
                        "grid gap-10",
                        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                        {filtered?.map((insight, index: number) => (
                            <motion.div
                                key={insight.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/insights/${insight.slug}`} className="block group">
                                    <div className={cn(
                                        "border border-border/50 transition-all duration-300 overflow-hidden",
                                        viewMode === 'grid' 
                                            ? "bg-card hover:shadow-2xl hover:border-primary/40" 
                                            : "bg-card/50 flex flex-col md:flex-row hover:bg-card hover:border-primary/30"
                                    )}>
                                        {insight.image && (
                                            <div className={cn(
                                                "relative overflow-hidden shrink-0",
                                                viewMode === 'grid' ? "h-56 w-full" : "h-64 md:h-auto md:w-80"
                                            )}>
                                                <Image
                                                    src={insight.image}
                                                    alt={insight.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover transition-transform group-hover:scale-105 duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            </div>
                                        )}
                                        <div className="p-8 flex-1 flex flex-col">
                                            <div className="flex items-center gap-4 mb-4 text-[10px] uppercase font-bold tracking-widest text-primary">
                                                {insight.category && (
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded">
                                                        <Tag size={10} /> {insight.category}
                                                    </span>
                                                )}
                                                {insight.created_at && (
                                                    <span className="flex items-center gap-1.5 text-muted-foreground/50">
                                                        <Clock size={10} /> {new Date(insight.created_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className={cn(
                                                "font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight",
                                                viewMode === 'grid' ? "text-xl line-clamp-2" : "text-2xl"
                                            )}>
                                                {insight.title}
                                            </h3>
                                            <p className={cn(
                                                "text-muted-foreground text-sm leading-relaxed mb-6 transition-colors group-hover:text-foreground",
                                                viewMode === 'grid' ? "line-clamp-3" : "line-clamp-2"
                                            )}>
                                                {(insight.excerpt || insight.content || '').replace(/<[^>]*>?/gm, '').substring(0, 150)}
                                            </p>
                                            <div className="mt-auto pt-4 border-t border-border/10 flex items-center justify-between">
                                                <span className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                                    Read Analysis <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                                </span>
                                            </div>
                                        </div>
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
