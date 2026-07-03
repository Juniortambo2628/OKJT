"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import { Zap, Landmark, Globe, Sparkles, Palette, Users, Rocket, TrendingUp, Code2, Cpu, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import ViewToggle, { ViewMode } from '@/components/ViewToggle'
import { Service, Pillar } from '@/types/api'
import FadeIn from '@/components/animations/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger'
import { useSettings } from '@/hooks/use-settings'
import { usePageHeroMedia } from '@/hooks/use-page-hero-media'
import SkeletonCard from '@/components/SkeletonCard'
import ParallaxSection from '@/components/ParallaxSection'
import BaseLayout from '@/components/BaseLayout'
import { type NavSection } from '@/lib/nav-sections'

const getIconComponent = (iconName: string | null) => {
    if (!iconName) return Globe;
    const icons: Record<string, any> = {
        Zap, Landmark, Globe, Sparkles, Palette, Users, Rocket, TrendingUp, Code2, Cpu
    }
    return icons[iconName] || Globe;
}

export default function ServicesIndexContent() {
    const { getSetting, isLoading: settingsLoading } = useSettings()
    const { videoSrc, bgImage, mediaLoading } = usePageHeroMedia({ settingsKey: 'hero_services_media' })
    const heroMedia = videoSrc ?? bgImage
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
            'Branding': {
                icon: Sparkles,
                gradient: 'from-blue-500 to-cyan-400',
                description: 'Crafting brand identities that resonate and stand out in the digital landscape.',
            },
            'Cloud Solutions': {
                icon: Globe,
                gradient: 'from-emerald-500 to-teal-400',
                description: 'Cloud architecture, DevOps pipelines, and scalable serverless environments.',
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

    const navSections = React.useMemo<NavSection[]>(() => {
        const sections: NavSection[] = [{ id: 'hero', label: 'Intro' }]
        groupedServices.forEach((group, index) => {
            sections.push({
                id: `group-${index}`,
                label: group.title
            })
        })
        return sections
    }, [groupedServices])

    return (
        <BaseLayout
            navSections={navSections}
            heroMedia={heroMedia}
            tagline="Our Services"
            title={servicesTitle}
            subtitle={servicesSubtitle}
            loading={settingsLoading || mediaLoading}
        >
            <section className="bg-background py-10 border-b border-white/5 relative z-10">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="flex justify-center mt-4">
                        <ViewToggle mode={viewMode} onChange={setViewMode} label="Services View" />
                    </div>
                </div>
            </section>

            <div className="relative bg-black w-full overflow-visible">
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

                    return (
                        <ParallaxSection
                            key={`group-${groupIndex}`}
                            id={`group-${groupIndex}`}
                            heightClass="min-h-[220vh]"
                            contentMaxWidth="max-w-[1400px]"
                        >
                            <div className="w-full">
                                <FadeIn
                                    direction="up"
                                    distance={24}
                                    className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12"
                                >
                                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${group.gradient} flex items-center justify-center shrink-0 shadow-lg shadow-black/10`}>
                                        <Icon className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 drop-shadow-2xl">{group.title}</h2>
                                        <p className="text-white/70 max-w-2xl leading-relaxed">{group.description}</p>
                                    </div>
                                </FadeIn>

                                <StaggerContainer className={cn(
                                    "grid gap-6 w-full",
                                    viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                                )}>
                                    {group.items.map((service) => (
                                        <StaggerItem key={service.id}>
                                            <Link
                                                href={`/services/${service.slug}`}
                                                className={cn(
                                                    "block group border transition-all duration-300 rounded-2xl overflow-hidden",
                                                    viewMode === 'grid' 
                                                        ? "bg-black/20 border-white/5 p-8 h-full hover:border-primary/45 hover:-translate-y-1" 
                                                        : "bg-black/20 border-white/5 p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-black/40 hover:border-primary/30"
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex-1 min-w-0 w-full",
                                                    viewMode === 'list' && "md:flex md:items-center md:gap-8"
                                                )}>
                                                    <div className={cn(viewMode === 'list' && "md:min-w-[300px] w-full text-center md:text-left")}>
                                                        <h3 className="text-lg md:text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors truncate">
                                                            {service.title}
                                                        </h3>
                                                        {viewMode === 'list' && (
                                                            <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest rounded-full mb-3 md:mb-0">
                                                                {group.title}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={cn(
                                                        "text-white/60 text-sm leading-relaxed transition-colors group-hover:text-white/80 w-full text-center md:text-left",
                                                        viewMode === 'grid' ? "line-clamp-3 mb-6" : "flex-1 line-clamp-2 md:line-clamp-1 mb-4 md:mb-0"
                                                    )}>
                                                        {service.description}
                                                    </p>
                                                </div>
                                                <span className={cn(
                                                    "text-primary font-bold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 justify-center md:justify-start w-full md:w-auto",
                                                    viewMode === 'list' && "md:ml-auto"
                                                )}>
                                                    Learn More
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </span>
                                            </Link>
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>

                                {group.items.length === 0 && !isLoading && (
                                    <FadeIn className="text-center py-16 text-white/30 border border-dashed border-white/10 rounded-2xl bg-black/20" direction="up" distance={16} blur={false}>
                                        Services for this category are being finalised.
                                    </FadeIn>
                                )}
                            </div>
                        </ParallaxSection>
                    )
                })}
            </div>
        </BaseLayout>
    )
}
