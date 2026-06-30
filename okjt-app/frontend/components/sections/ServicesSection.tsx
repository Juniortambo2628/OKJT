"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApi } from '@/hooks/use-api'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSettings } from '@/hooks/use-settings'
import { SectionSkeleton } from '@/components/MediaSkeleton'
import ParallaxSection from '@/components/ParallaxSection'
import { SectionCard } from '@/components/ui/SectionCard'

const categories = ['All', 'Web Development', 'UI/UX Design', 'Digital Strategy']

const MAX_SERVICES_SHOWN = 7

const ServicesSection = () => {
    const { data: services, isLoading: servicesLoading, isError: servicesError } = useApi('/services')
    const { getSetting, isLoading: settingsLoading } = useSettings()
    
    const [activeCategory, setActiveCategory] = useState('All')
    const [expandedService, setExpandedService] = useState<number | null>(null)

    const sectionTagline = getSetting('services_tagline')
    const sectionTitle = getSetting('services_title')
    
    const bgMedia = getSetting('bg_home_services', '/assets/videos/services/all-services-video.mp4')

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
            bgMedia={bgMedia}
            heightClass="min-h-[230vh]"
            contentMaxWidth="max-w-[1400px]"
            badgeText={sectionTagline || "SERVICES"}
            title={sectionTitle}
        >
            <SectionCard
                toolbarTitle="Categories"
                tabs={categories}
                activeTab={activeCategory}
                onTabChange={(cat) => {
                    setActiveCategory(cat)
                    setExpandedService(null)
                }}
            >
                {/* Services Accordion List */}
                <div className="w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="divide-y divide-foreground/10"
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
                                            <span className="text-foreground/30 text-xs font-mono">{String(index + 1).padStart(2, '0')}</span>
                                            <h3 className={`text-base md:text-lg font-bold transition-colors ${
                                                expandedService === service.id ? 'text-primary' : 'text-foreground/90 group-hover:text-primary'
                                            }`}>
                                                {service.title}
                                            </h3>
                                        </div>
                                        <ChevronDown className={`h-5 w-5 text-foreground/30 transition-transform ${
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
                                                <div className="pb-6 pl-8">
                                                    <span className="text-primary/80 text-[10px] font-bold uppercase tracking-widest block mb-2">
                                                        {service.category}
                                                    </span>
                                                    <p className="text-foreground/70 text-sm leading-relaxed mb-4 max-w-2xl">
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
                            className="mt-8 text-center"
                        >
                            <Button
                                variant="outline"
                                className="font-bold text-xs uppercase tracking-wider"
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
                        <div className="py-20 text-center text-foreground/30 border border-dashed border-foreground/10 rounded-xl">
                            No services available in this category yet.
                        </div>
                    )}
                </div>
            </SectionCard>
        </ParallaxSection>
    )
}

export default ServicesSection
