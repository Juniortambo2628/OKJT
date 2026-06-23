"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Landmark, Globe, Sparkles, Palette, Users, Rocket, TrendingUp, Code2, Cpu } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import ViewToggle, { ViewMode } from '@/components/ViewToggle'
import { Service, Pillar } from '@/types/api'

const getIconComponent = (iconName: string | null) => {
    if (!iconName) return Globe;
    const icons: Record<string, any> = {
        Zap, Landmark, Globe, Sparkles, Palette, Users, Rocket, TrendingUp, Code2, Cpu
    }
    return icons[iconName] || Globe;
}

import PageHero from '@/components/PageHero'
import { useSettings } from '@/hooks/use-settings'
import { usePageHeroMedia } from '@/hooks/use-page-hero-media'
import SkeletonCard from '@/components/SkeletonCard'

export default function ServicesIndexContent() {
    const { getSetting, isLoading: settingsLoading } = useSettings()
    const { videoSrc, bgImage, mediaLoading } = usePageHeroMedia({ settingsKey: 'hero_services_media' })
    const { data: services, isLoading } = useApi<Service[]>('/services')
    const [viewMode, setViewMode] = React.useState<ViewMode>('grid')

    const servicesTitle = getSetting('services_title')
    const servicesSubtitle = getSetting('services_subtitle')

    const groupedServices = React.useMemo(() => {
        if (!services || !Array.isArray(services)) return []
        
        const groups: Record<string, { title: string, description: string, icon: any, gradient: string, items: Service[] }> = {}

        const categoryMeta: Record<string, { icon: any; gradient: string; description: string }> = {
            'Web Development': {
                icon: Code2,
                gradient: 'from-blue-500 to-cyan-400',
                description: 'High-performance web applications, e-commerce, and bespoke administrative tools.',
            },
            'UI/UX Design': {
                icon: Palette,
                gradient: 'from-emerald-500 to-teal-400',
                description: 'Breathtaking interfaces, custom design systems, and friction-free user flows.',
            },
            'Digital Strategy': {
                icon: Cpu,
                gradient: 'from-violet-500 to-purple-400',
                description: 'Architecture consulting, performance optimization, and digital transformation roadmaps.',
            },
            'Energy Advisory': {
                icon: Zap,
                gradient: 'from-blue-500 to-cyan-400',
                description: 'Comprehensive advisory across due diligence, commercial strategy, and market intelligence.',
            },
            'Fintech': {
                icon: Landmark,
                gradient: 'from-emerald-500 to-teal-400',
                description: 'Strategic advisory for financial technology companies and compliance support.',
            },
            'International Diplomacy': {
                icon: Globe,
                gradient: 'from-violet-500 to-purple-400',
                description: 'Geopolitical risk management, cross-border deals, and reputational positioning.',
            }
        }

        services.forEach((s) => {
            const groupKey = s.pillar ? s.pillar.title : s.category
            if (!groupKey) return

            if (!groups[groupKey]) {
                const meta = categoryMeta[groupKey] || {
                    icon: getIconComponent(s.pillar?.icon || null),
                    gradient: 'from-primary/80 to-primary',
                    description: s.pillar?.overview || 'Bespoke services tailored to your technical and business needs.'
                }
                groups[groupKey] = {
                    title: groupKey,
                    description: s.pillar?.overview || meta.description,
                    icon: s.pillar ? getIconComponent(s.pillar.icon) : meta.icon,
                    gradient: meta.gradient || 'from-primary/80 to-primary',
                    items: []
                }
            }
            groups[groupKey].items.push(s)
        })

        return Object.values(groups)
    }, [services])

    return (
        <main className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <PageHero 
                centered
                tagline="Our Services"
                title={servicesTitle}
                subtitle={servicesSubtitle}
                videoSrc={videoSrc}
                bgImage={bgImage}
                mediaLoading={mediaLoading}
                contentLoading={settingsLoading}
            />

            <section className="bg-background py-10 border-b border-white/5">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="flex justify-center mt-4">
                        <ViewToggle mode={viewMode} onChange={setViewMode} label="Services View" />
                    </div>
                </div>
            </section>

            {/* Category Sections */}
            {isLoading && (
                <section className="py-24 bg-background">
                    <div className="max-w-[1400px] mx-auto px-6">
                        <SkeletonCard variant={viewMode} count={6} />
                    </div>
                </section>
            )}

            {groupedServices.map((group, groupIndex) => {
                const Icon = group.icon
                const isEven = groupIndex % 2 === 0

                return (
                    <section
                        key={`group-${groupIndex}`}
                        className={`py-24 ${isEven ? 'bg-secondary/20' : 'bg-background'}`}
                    >
                        <div className="max-w-[1400px] mx-auto px-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="flex flex-col md:flex-row items-start gap-8 mb-16"
                            >
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${group.gradient} flex items-center justify-center shrink-0 shadow-lg shadow-black/10`}>
                                    <Icon className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{group.title}</h2>
                                    <p className="text-muted-foreground max-w-2xl leading-relaxed">{group.description}</p>
                                </div>
                            </motion.div>

                            <div className={cn(
                                "grid gap-8",
                                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                            )}>
                                {group.items.map((service, index: number) => (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.08 }}
                                    >
                                        <Link
                                            href={`/services/${service.slug}`}
                                            className={cn(
                                                "block group border border-border/50 transition-all duration-300",
                                                viewMode === 'grid' 
                                                    ? "bg-card p-8 h-full hover:shadow-2xl hover:border-primary/40 hover:-translate-y-1" 
                                                    : "bg-card/50 p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-card hover:border-primary/30"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex-1 min-w-0",
                                                viewMode === 'list' && "md:flex md:items-center md:gap-8"
                                            )}>
                                                <div className={cn(viewMode === 'list' && "md:min-w-[300px]")}>
                                                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors truncate">
                                                        {service.title}
                                                    </h3>
                                                    {viewMode === 'list' && (
                                                        <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded mb-3 md:mb-0">
                                                            {group.title}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={cn(
                                                    "text-muted-foreground text-sm leading-relaxed transition-colors group-hover:text-foreground",
                                                    viewMode === 'grid' ? "line-clamp-3 mb-6" : "flex-1 line-clamp-2 md:line-clamp-1 mb-4 md:mb-0"
                                                )}>
                                                    {service.description}
                                                </p>
                                            </div>
                                            <span className={cn(
                                                "text-primary font-bold text-sm uppercase tracking-wider flex items-center gap-2 shrink-0",
                                                viewMode === 'list' && "md:ml-auto"
                                            )}>
                                                Learn More
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {group.items.length === 0 && !isLoading && (
                                <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border/50">
                                    Services for this category are being finalised.
                                </div>
                            )}
                        </div>
                    </section>
                )
            })}

            <Footer />
        </main>
    )
}
