"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useApi } from '@/hooks/use-api'
import { ArrowRight, ArrowUpRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { SectionSkeleton } from '@/components/MediaSkeleton'
import { Card } from '@/components/ui/card'
import { useSettings } from '@/hooks/use-settings'
import ParallaxSection from '@/components/ParallaxSection'
import { SectionCard } from '@/components/ui/SectionCard'

const InsightsSection = () => {
    const { data: insights, isLoading, isError } = useApi('/insights')
    const { getSetting } = useSettings()
    const [activeTab, setActiveTab] = useState('Featured')
    const bgMedia = getSetting('bg_home_insights', '/assets/videos/services/all-services-video.mp4')

    if (isLoading) return <SectionSkeleton />
    if (isError || !insights || insights.length === 0) {
        return (
            <ParallaxSection 
                id="insights" 
                bgMedia={bgMedia} 
                heightClass="min-h-[230vh]"
                badgeText="Technical Insights"
                title="Latest Articles & News"
            >
                <div className="w-full text-center bg-foreground/5 border border-foreground/10 rounded-[2rem] p-12">
                    <p className="text-foreground/60">The latest research notes and advisory updates will appear here as they are published.</p>
                </div>
            </ParallaxSection>
        )
    }

    const featured = insights[0]
    const rest = insights.slice(1, 4)

    return (
        <ParallaxSection
            id="insights"
            bgMedia={bgMedia}
            heightClass="min-h-[230vh]"
            contentMaxWidth="max-w-[1400px]"
            badgeText="Technical Insights"
            title="Latest Articles & News"
        >
            <SectionCard
                toolbarTitle="Filter Insights"
                tabs={['Featured', 'Latest']}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            >
                <AnimatePresence mode="wait">
                    {activeTab === 'Featured' ? (
                        <motion.div
                            key="featured"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Link href={`/insights/${featured.slug}`} className="block group w-full h-[450px]">
                                <Card className="relative w-full h-full overflow-hidden border border-foreground/10 rounded-[1.5rem] bg-foreground/5 backdrop-blur-md">
                                    {featured.image && (
                                        <Image
                                            src={featured.image}
                                            alt={featured.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                        />
                                    )}
                                    {!featured.image && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                                    <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 z-10">
                                        <div className="flex items-center gap-4 mb-4 text-xs text-white/70">
                                            {featured.category && (
                                                <span className="bg-primary/80 text-black px-3 py-1 font-bold uppercase tracking-wider rounded-sm">
                                                    {featured.category}
                                                </span>
                                            )}
                                            {featured.created_at && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {new Date(featured.created_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 group-hover:text-primary transition-colors max-w-4xl line-clamp-2">
                                            {featured.title}
                                        </h3>
                                        <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-3xl line-clamp-2 mb-6">
                                            {featured.excerpt || featured.content?.substring(0, 200)}
                                        </p>
                                        <span className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 group-hover:text-primary transition-colors">
                                            Read Full Article <ArrowUpRight className="h-5 w-5" />
                                        </span>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="latest"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {rest.map((insight: any, index: number) => (
                                <Link key={insight.id} href={`/insights/${insight.slug}`} className="block group h-full">
                                    <Card className="flex flex-col h-full hover:shadow-2xl border border-foreground/10 hover:border-primary/30 bg-background/40 backdrop-blur-md rounded-2xl transition-all overflow-hidden">
                                        {insight.image ? (
                                            <div className="relative w-full h-48 overflow-hidden">
                                                <Image
                                                    src={insight.image}
                                                    alt={insight.title}
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-105 duration-500 opacity-90"
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative w-full h-48 bg-foreground/5 flex items-center justify-center">
                                                <span className="text-foreground/20 font-bold uppercase tracking-widest text-xs">No Image</span>
                                            </div>
                                        )}
                                        
                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex items-center gap-3 mb-3 text-[11px] text-foreground/50">
                                                {insight.category && (
                                                    <span className="text-primary font-bold uppercase tracking-wider">{insight.category}</span>
                                                )}
                                                {insight.created_at && (
                                                    <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3">
                                                {insight.title}
                                            </h3>
                                            <p className="text-foreground/60 text-sm line-clamp-3 mb-6">
                                                {insight.excerpt || insight.content?.substring(0, 100)}
                                            </p>
                                            
                                            <div className="mt-auto">
                                                <span className="text-foreground/70 font-bold text-xs uppercase tracking-wider flex items-center gap-2 group-hover:text-primary transition-colors">
                                                    Read More <ArrowRight className="h-3 w-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </SectionCard>
        </ParallaxSection>
    )
}

export default InsightsSection
