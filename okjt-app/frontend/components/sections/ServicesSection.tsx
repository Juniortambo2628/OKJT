"use client"

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApi } from '@/hooks/use-api'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getMediaUrl } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'
import { SectionSkeleton, SkeletonBlock } from '@/components/MediaSkeleton'
import CategoryFilter from '@/components/ui/CategoryFilter'
import ParallaxSection from '@/components/ParallaxSection'

const categories = ['All', 'Web Development', 'UI/UX Design', 'Digital Strategy']

const MAX_SERVICES_SHOWN = 7

const ServicesSection = () => {
    const { data: services, isLoading: servicesLoading, isError: servicesError } = useApi('/services')
    const { getSetting, isLoading: settingsLoading } = useSettings()
    
    const [activeCategory, setActiveCategory] = useState('All')
    const [expandedService, setExpandedService] = useState<number | null>(null)

    const sectionTagline = getSetting('services_tagline')
    const sectionTitle = getSetting('services_title')
    
    const dynamicVideos: Record<string, string> = {
        'All': getMediaUrl(getSetting('services_video_all')) || '/assets/videos/services/all-services-video.mp4',
        'Web Development': getMediaUrl(getSetting('services_video_software')) || '/assets/videos/services/energy-advisory.mp4',
        'UI/UX Design': getMediaUrl(getSetting('services_video_electronics')) || '/assets/videos/services/fintech-video.mp4',
        'Digital Strategy': getMediaUrl(getSetting('services_video_innovation')) || '/assets/videos/services/international-diplomacy-video.mp4',
    }

    if (servicesLoading || settingsLoading) return <SectionSkeleton />
    if (servicesError) return null

    const filteredServices = activeCategory === 'All'
        ? services
        : services?.filter((s: any) => s.category === activeCategory)

    const displayedServices = filteredServices?.slice(0, MAX_SERVICES_SHOWN) || []
    const hasMore = (filteredServices?.length || 0) > MAX_SERVICES_SHOWN

    // Determine the link for the "See All" button depending on category
    const seeAllHref = activeCategory === 'All' ? '/services' : `/services?category=${encodeURIComponent(activeCategory)}`

    return (
        <ParallaxSection
            id="services"
            bgMedia={dynamicVideos[activeCategory] || dynamicVideos['All']}
            heightClass="min-h-[220vh]"
            contentMaxWidth="max-w-[1400px]"
        >
            {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 text-center md:text-left"
                >
                    <span className="text-primary font-bold text-sm uppercase tracking-[0.2em] mb-4 block">
                        {sectionTagline || "SERVICES"}
                    </span>
                    <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-2xl">
                            {sectionTitle}
                        </h2>

                        {/* Category Tabs */}
                        <CategoryFilter
                            categories={categories}
                            activeCategory={activeCategory}
                            onCategoryChange={(cat) => { setActiveCategory(cat); setExpandedService(null); }}
                        />
                    </div>
                </motion.div>

                {/* Services Accordion List (Full Width) */}
                <div className="w-full border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="divide-y divide-white/10"
                        >
                            {displayedServices.map((service: any, index: number) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ 
                                        duration: 0.5, 
                                        delay: index * 0.08,
                                        ease: [0.215, 0.61, 0.355, 1] 
                                    }}
                                    className="group"
                                >
                                    <button
                                        onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
                                        className="w-full flex items-center justify-between py-5 text-left hover:pl-2 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-white/30 text-xs font-mono">{String(index + 1).padStart(2, '0')}</span>
                                            <h3 className={`text-base md:text-lg font-bold transition-colors ${
                                                expandedService === service.id ? 'text-primary' : 'text-white/95 group-hover:text-primary'
                                            }`}>
                                                {service.title}
                                            </h3>
                                        </div>
                                        <ChevronDown className={`h-5 w-5 text-white/30 transition-transform ${
                                            expandedService === service.id ? 'rotate-180 text-primary' : ''
                                        }`} />
                                    </button>

                                    <AnimatePresence>
                                        {expandedService === service.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pb-5 pl-8">
                                                    <span className="text-primary/60 text-[10px] font-bold uppercase tracking-widest block mb-2">
                                                        {service.category}
                                                    </span>
                                                    <p className="text-white/70 text-sm leading-relaxed mb-4 max-w-2xl">
                                                        {service.description}
                                                    </p>
                                                    <Link href={`/services/${service.slug}`} className="text-primary font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:underline group/link">
                                                        Learn More
                                                        <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* See All Button */}
                    {hasMore && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-6 text-center"
                        >
                            <Button
                                variant="outline"
                                className="rounded-none border-white/10 bg-transparent text-white/75 hover:text-white hover:border-primary font-bold text-xs uppercase tracking-wider px-8 py-5"
                                asChild
                            >
                                <Link href={seeAllHref}>
                                    View All {filteredServices?.length} Services
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.div>
                    )}

                    {(!filteredServices || filteredServices.length === 0) && (
                        <div className="py-20 text-center text-white/30 border border-dashed border-white/10">
                            No services available in this category yet.
                        </div>
                    )}
                </div>
        </ParallaxSection>
    )
}

export default ServicesSection
