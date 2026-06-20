"use client"

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useApi } from '@/hooks/use-api'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getMediaUrl } from '@/lib/utils'

const categories = ['All', 'Web Development', 'UI/UX Design', 'Digital Strategy']

// Free stock videos from Pixabay CDN (no API key required)
const categoryVideos: Record<string, string> = {
    'All': '/assets/videos/services/all-services-video.mp4',
    'Web Development': '/assets/videos/services/fintech-video.mp4', 
    'UI/UX Design': '/assets/videos/services/energy-advisory.mp4',
    'Digital Strategy': '/assets/videos/services/international-diplomacy-video.mp4',
}

const MAX_SERVICES_SHOWN = 7

const ServicesSection = () => {
    const { data: services, isLoading: servicesLoading, isError: servicesError } = useApi('/services')
    const { data: settingsByGroup } = useApi('/settings')
    
    const [activeCategory, setActiveCategory] = useState('All')
    const [expandedService, setExpandedService] = useState<number | null>(null)
    const { scrollY } = useScroll()
    const sectionScale = useTransform(scrollY, [0, 4000], [0.98, 1])

    // Helper to get setting value
    const getSetting = (key: string, defaultValue: string) => {
        if (!settingsByGroup) return defaultValue
        const allSettings = Object.values(settingsByGroup).flat() as any[]
        const setting = allSettings.find(s => s.key === key)
        return setting?.value || defaultValue
    }

    const sectionTagline = getSetting('services_tagline', 'Our Expertise')
    const sectionTitle = getSetting('services_title', 'Explore our technical services')
    
    const dynamicVideos: Record<string, string> = {
        'All': getMediaUrl(getSetting('services_video_all', categoryVideos['All'])),
        'Web Development': getMediaUrl(getSetting('services_video_software', categoryVideos['Web Development'])),
        'UI/UX Design': getMediaUrl(getSetting('services_video_electronics', categoryVideos['UI/UX Design'])),
        'Digital Strategy': getMediaUrl(getSetting('services_video_innovation', categoryVideos['Digital Strategy'])),
    }

    if (servicesLoading) return <div className="py-20 text-center text-white/40">Loading services...</div>
    if (servicesError) return null

    const filteredServices = activeCategory === 'All'
        ? services
        : services?.filter((s: any) => s.category === activeCategory)

    const displayedServices = filteredServices?.slice(0, MAX_SERVICES_SHOWN) || []
    const hasMore = (filteredServices?.length || 0) > MAX_SERVICES_SHOWN

    // Determine the link for the "See All" button depending on category
    const seeAllHref = activeCategory === 'All' ? '/services' : `/services?category=${encodeURIComponent(activeCategory)}`

    return (
        <motion.section
            id="services"
            className="w-full py-32 bg-background relative overflow-hidden"
            style={{ scale: sectionScale }}
        >
            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <span className="text-primary font-bold text-sm uppercase tracking-[0.2em] mb-4 block">
                        {sectionTagline}
                    </span>
                    <div className="flex flex-col md:flex-row items-end justify-between gap-8">
                        <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
                            {sectionTitle}
                        </h2>

                        {/* Category Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => { setActiveCategory(cat); setExpandedService(null); }}
                                    className={`text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-all border ${
                                        activeCategory === cat
                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                            : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Two-Column: Video + Services List */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Sticky Video Column */}
                    <div className="lg:col-span-2 hidden lg:block">
                        <div className="sticky top-32">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeCategory}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative aspect-[3/4] overflow-hidden bg-card"
                                >
                                    <video
                                        key={activeCategory}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="absolute inset-0 w-full h-full object-cover"
                                    >
                                        <source src={dynamicVideos[activeCategory] || dynamicVideos['All']} type="video/mp4" />
                                    </video>
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <span className="text-primary font-bold text-xs uppercase tracking-widest">{activeCategory}</span>
                                        <p className="text-muted-foreground text-sm mt-2">
                                            {filteredServices?.length || 0} services available
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Services Accordion List */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.3 }}
                                className="divide-y divide-border"
                            >
                                {displayedServices.map((service: any, index: number) => (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ 
                                            duration: 0.5, 
                                            delay: index * 0.1,
                                            ease: [0.215, 0.61, 0.355, 1] 
                                        }}
                                        className="group"
                                    >
                                        <button
                                            onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
                                            className="w-full flex items-center justify-between py-6 text-left hover:pl-2 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-muted-foreground/20 text-xs font-mono">{String(index + 1).padStart(2, '0')}</span>
                                                <h3 className={`text-lg font-bold transition-colors ${
                                                    expandedService === service.id ? 'text-primary' : 'text-foreground group-hover:text-primary'
                                                }`}>
                                                    {service.title}
                                                </h3>
                                            </div>
                                            <ChevronDown className={`h-5 w-5 text-muted-foreground/30 transition-transform ${
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
                                                    <div className="pb-6 pl-10">
                                                        <span className="text-primary/60 text-[10px] font-bold uppercase tracking-widest block mb-2">
                                                            {service.category}
                                                        </span>
                                                        <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-lg">
                                                            {service.description}
                                                        </p>
                                                        <a href={`/services/${service.slug}`} className="text-primary font-bold text-sm uppercase tracking-wider flex items-center gap-2 hover:underline group/link">
                                                            Learn More
                                                            <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                                                        </a>
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
                                className="mt-8 text-center"
                            >
                                <Button
                                    variant="outline"
                                    className="rounded-none border-border text-muted-foreground hover:text-foreground hover:border-primary font-bold text-sm uppercase tracking-wider px-8 py-5"
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
                            <div className="py-20 text-center text-muted-foreground/30 border border-dashed border-border">
                                No services available in this category yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.section>
    )
}


export default ServicesSection
