"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import Hero from '@/components/Hero'
import { useSettings } from '@/hooks/use-settings'
import { usePageHeroMedia } from '@/hooks/use-page-hero-media'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import ViewToggle, { ViewMode } from '@/components/ViewToggle'
import CategoryFilter from '@/components/ui/CategoryFilter'
import SkeletonCard from '@/components/SkeletonCard'
import { Insight } from '@/types/api'
import ParallaxSection from '@/components/ParallaxSection'
import { SectionCard } from '@/components/ui/SectionCard'
import { PageShell } from '@/components/PageShell'
import { INSIGHTS_NAV_SECTIONS } from '@/lib/nav-sections'

export default function InsightsContent() {
    const { getSetting, isLoading: settingsLoading } = useSettings()
    const { videoSrc, bgImage, mediaLoading } = usePageHeroMedia({ settingsKey: 'hero_insights_media' })
    const { data: insights, isLoading } = useApi<Insight[]>('/insights')
    const [viewMode, setViewMode] = React.useState<ViewMode>('grid')

    const bgInsights = getSetting('bg_insights_grid')

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
        <PageShell navSections={INSIGHTS_NAV_SECTIONS}>
            <Hero
                id="hero"
                tagline="Thought Leadership"
                title="Insights &amp; Research"
                subtitle="Analysis, commentary, and research from our team on the trends shaping web development, design, and digital strategy."
                videos={videoSrc ? [videoSrc] : undefined}
                bgImage={bgImage}
                loading={settingsLoading || mediaLoading}
            />

            <div className="relative bg-black w-full overflow-visible">
            <ParallaxSection 
                id="insights-grid" 
                bgMedia={bgInsights}
                heightClass="min-h-[220vh]"
                contentMaxWidth="max-w-[1400px]"
            >
                <SectionCard>
                    <div className="w-full">
                        {/* Filter Bar */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 pb-6 border-b border-white/10">
                            {/* Category Filter */}
                            <CategoryFilter
                                categories={categories}
                                activeCategory={activeCategory}
                                onCategoryChange={setActiveCategory}
                            />

                            <ViewToggle mode={viewMode} onChange={setViewMode} label="Layout" />
                        </div>

                        {isLoading && <SkeletonCard variant={viewMode} count={6} />}

                        {!isLoading && (!filtered || filtered.length === 0) && (
                            <div className="text-center py-20 text-white/30 border border-dashed border-white/10 rounded-2xl bg-black/20">
                                No insights available yet. Check back soon.
                            </div>
                        )}

                        <div className={cn(
                            "grid gap-6 w-full",
                            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                        )}>
                            {filtered?.map((insight, index: number) => (
                                <motion.div
                                    key={insight.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link href={`/insights/${insight.slug}`} className="block group h-full">
                                        <div className={cn(
                                            "border transition-all duration-300 overflow-hidden rounded-2xl bg-black/20 h-full",
                                            viewMode === 'grid' 
                                                ? "border-white/5 hover:border-primary/45" 
                                                : "border-white/5 flex flex-col md:flex-row hover:bg-black/40 hover:border-primary/30"
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
                                                        className="object-cover transition-transform group-hover:scale-105 duration-700 opacity-80 group-hover:opacity-95"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                                </div>
                                            )}
                                            <div className="p-8 flex-1 flex flex-col">
                                                <div className="flex items-center gap-4 mb-4 text-[9px] uppercase font-bold tracking-widest text-primary">
                                                    {insight.category && (
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded">
                                                            <Tag size={10} /> {insight.category}
                                                        </span>
                                                    )}
                                                    {insight.created_at && (
                                                        <span className="flex items-center gap-1.5 text-white/50">
                                                            <Clock size={10} /> {new Date(insight.created_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={cn(
                                                    "font-bold text-white mb-3 group-hover:text-primary transition-colors leading-tight",
                                                    viewMode === 'grid' ? "text-lg line-clamp-2" : "text-xl"
                                                )}>
                                                    {insight.title}
                                                </h3>
                                                <p className={cn(
                                                    "text-white/60 text-xs sm:text-sm leading-relaxed mb-6 transition-colors group-hover:text-white/80",
                                                    viewMode === 'grid' ? "line-clamp-3" : "line-clamp-2"
                                                )}>
                                                    {(insight.excerpt || insight.content || '').replace(/<[^>]*>?/gm, '').substring(0, 150)}
                                                </p>
                                                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
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
                </SectionCard>
            </ParallaxSection>
            </div>
        </PageShell>
    )
}
