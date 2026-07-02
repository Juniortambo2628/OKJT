"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Hero from '@/components/Hero'
import FadeIn from '@/components/animations/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger'
import { useSettings } from '@/hooks/use-settings'
import { SectionSkeleton } from '@/components/MediaSkeleton'
import ParallaxSection from '@/components/ParallaxSection'
import { SectionCard } from '@/components/ui/SectionCard'
import { PageShell } from '@/components/PageShell'
import { SERVICE_DETAIL_NAV_SECTIONS, type NavSection } from '@/lib/nav-sections'
import { Service } from '@/types/api'

const benefits = [
    'Data-driven insights tailored to your market',
    'Experienced advisory team with deep sector knowledge',
    'Transparent methodology and clear deliverables',
    'Proven track record of measurable outcomes',
    'End-to-end support from analysis to execution',
]

export default function ServiceDetailContent({ slug }: { slug: string }) {
    const { getSetting } = useSettings()
    const { data: service, isLoading, isError } = useApi<Service>(`/services/${slug}`)
    const { data: allServices } = useApi<Service[]>('/services')

    const relatedServices = allServices?.filter((s) => s.slug !== slug && s.category === service?.category).slice(0, 3)

    const navSections: NavSection[] = [
        ...SERVICE_DETAIL_NAV_SECTIONS,
        ...(relatedServices && relatedServices.length > 0 ? [{ id: 'service-related', label: 'Related' }] : []),
    ]

    if (isLoading) {
        return (
            <PageShell>
                <SectionSkeleton />
            </PageShell>
        )
    }

    if (isError || !service) {
        return (
            <PageShell>
                <div className="flex-1 flex items-center justify-center pt-32">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-foreground mb-4">Service Not Found</h1>
                        <p className="text-muted-foreground mb-8">The requested advisory service could not be found.</p>
                        <Button asChild variant="outline"><Link href="/#services">Explore Services</Link></Button>
                    </div>
                </div>
            </PageShell>
        )
    }

    const mediaUrl = service.image || service.pillar?.image
    const isVideo = mediaUrl && (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm'))

    return (
        <PageShell navSections={navSections}>
            <Hero
                id="hero"
                tagline={service.category}
                title={service.title}
                subtitle={service.description}
                videos={isVideo ? [mediaUrl].filter(Boolean) as string[] : undefined}
                bgImage={!isVideo ? mediaUrl ?? undefined : undefined}
                breadcrumbs={[
                    { label: 'Services', href: '/services' },
                    { label: service.title }
                ]}
                cta={{ label: 'Book a Consultation', href: '/contact' }}
            />

            <div className="bg-black w-full overflow-visible">
            {/* Service Detail Content */}
            <ParallaxSection
                id="service-details"
                bgMedia={mediaUrl}
                heightClass="min-h-[170vh]"
                contentMaxWidth="max-w-[1000px]"
            >
                <SectionCard>
                    <FadeIn direction="up" distance={24}>
                        <div
                            className="text-white/80 leading-relaxed text-sm md:text-base prose-p:leading-relaxed prose-p:text-white/80 prose-headings:text-white prose-strong:text-white prose-ul:text-white/85"
                            dangerouslySetInnerHTML={{ __html: service.content || service.description || '' }}
                        />
                    </FadeIn>
                </SectionCard>
            </ParallaxSection>

            {/* Benefits */}
            <ParallaxSection
                id="service-benefits"
                heightClass="min-h-[200vh]"
                badgeText="WHY OKJTECH?"
                title="Why Choose Our Expertise?"
                subtitle="Our approach is built on rigour, transparency, and measurable impact."
                contentMaxWidth="max-w-[1400px]"
            >
                <SectionCard>
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full" staggerDelay={0.08}>
                        {benefits.map((benefit, i) => (
                            <StaggerItem
                                key={i}
                                className="flex items-start gap-4 bg-black/20 p-8 border border-white/5 hover:border-primary/40 rounded-2xl transition-all group"
                            >
                                <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 shrink-0" />
                                <span className="text-white/85 font-light text-sm">{benefit}</span>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </SectionCard>
            </ParallaxSection>

            {/* Related Services */}
            {relatedServices && relatedServices.length > 0 && (
                <ParallaxSection
                    id="service-related"
                    heightClass="min-h-[170vh]"
                    badgeText="EXPLORE MORE"
                    title={`Other ${service.category} Services`}
                    contentMaxWidth="max-w-[1400px]"
                >
                    <SectionCard>
                        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full" staggerDelay={0.08}>
                            {relatedServices.map((rs) => (
                                <StaggerItem key={rs.id}>
                                    <Link href={`/services/${rs.slug}`} className="group block bg-black/20 p-8 border border-white/5 rounded-2xl hover:border-primary/45 hover:bg-black/40 transition-all h-full">
                                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors mb-4">{rs.title}</h3>
                                        <p className="text-white/60 text-sm line-clamp-2">{rs.description}</p>
                                        <div className="mt-6 flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest">
                                            Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </Link>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                        <div className="mt-8">
                            <Button variant="outline" className="rounded-none border-primary/30 text-primary hover:bg-primary/10" asChild>
                                <Link href="/services">
                                    View All Services <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </SectionCard>
                </ParallaxSection>
            )}

            {/* CTA */}
            <ParallaxSection
                id="service-cta"
                heightClass="min-h-[170vh]"
                contentMaxWidth="max-w-[1400px]"
            >
                <SectionCard className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Empower your next strategic move.
                        </h2>
                        <p className="text-white/70 max-w-xl mx-auto mb-12 text-lg font-light">
                            Connect with our advisory team to discuss how we can support your objectives in {service.category}.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                            <Button
                                size="lg"
                                className="h-16 px-12 text-lg font-bold rounded-none bg-primary text-[#14110b] hover:bg-primary/90 group shadow-2xl shadow-primary/20"
                                asChild
                            >
                                <Link href="/contact">
                                    Book a Consultation
                                    <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </SectionCard>
            </ParallaxSection>
            </div>
        </PageShell>
    )
}
