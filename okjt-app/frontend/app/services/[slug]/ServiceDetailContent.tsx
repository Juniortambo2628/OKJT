"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import { useSettings } from '@/hooks/use-settings'
import { SectionSkeleton } from '@/components/MediaSkeleton'
import ParallaxSection from '@/components/ParallaxSection'
import ParallaxNav from '@/components/ParallaxNav'
import { SectionCard } from '@/components/ui/SectionCard'

const benefits = [
    'Data-driven insights tailored to your market',
    'Experienced advisory team with deep sector knowledge',
    'Transparent methodology and clear deliverables',
    'Proven track record of measurable outcomes',
    'End-to-end support from analysis to execution',
]

export default function ServiceDetailContent({ slug }: { slug: string }) {
    const { getSetting } = useSettings()
    const { data: service, isLoading, isError } = useApi(`/services/${slug}`)
    const { data: allServices } = useApi('/services')

    const relatedServices = allServices?.filter((s: any) => s.slug !== slug && s.category === service?.category).slice(0, 3)

    if (isLoading) {
        return (
            <main className="flex min-h-screen flex-col bg-background">
                <Navbar />
                <SectionSkeleton />
                <Footer />
            </main>
        )
    }

    if (isError || !service) {
        return (
            <main className="flex min-h-screen flex-col bg-background">
                <Navbar />
                <div className="flex-1 flex items-center justify-center pt-32">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-foreground mb-4">Service Not Found</h1>
                        <p className="text-muted-foreground mb-8">The requested advisory service could not be found.</p>
                        <Button asChild variant="outline"><Link href="/#services">Explore Services</Link></Button>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    const mediaUrl = service.image || service.pillar?.image
    const isVideo = mediaUrl && (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm'))

    const navSections = [
        { id: 'hero', label: 'Intro' },
        { id: 'service-details', label: 'Overview' },
        { id: 'service-benefits', label: 'Benefits' },
        ...(relatedServices && relatedServices.length > 0 ? [{ id: 'service-related', label: 'Related' }] : []),
        { id: 'service-cta', label: 'Contact' }
    ]

    return (
        <main className="flex min-h-screen flex-col bg-background w-full overflow-x-hidden">
            <Navbar />

            <PageHero
                id="hero"
                tagline={service.category}
                title={service.title}
                subtitle={service.description}
                videoSrc={isVideo ? mediaUrl : undefined}
                bgImage={!isVideo ? mediaUrl : undefined}
                breadcrumbs={[
                    { label: 'Services', href: '/services' },
                    { label: service.title }
                ]}
            />

            <div className="bg-black w-full overflow-visible">
            {/* Service Detail Content */}
            <ParallaxSection
                id="service-details"
                bgMedia={mediaUrl || "/assets/videos/services/all-services-video.mp4"}
                heightClass="min-h-[170vh]"
                contentMaxWidth="max-w-[1000px]"
            >
                <SectionCard>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="prose prose-invert lg:prose-xl max-w-none"
                    >
                        <div 
                            className="text-white/80 leading-relaxed text-sm md:text-base prose-p:leading-relaxed prose-p:text-white/80 prose-headings:text-white prose-strong:text-white prose-ul:text-white/85"
                            dangerouslySetInnerHTML={{ __html: service.content || service.description || '' }} 
                        />
                    </motion.div>
                </SectionCard>
            </ParallaxSection>

            {/* Benefits */}
            <ParallaxSection
                id="service-benefits"
                bgMedia="/assets/videos/services/all-services-video.mp4"
                heightClass="min-h-[200vh]"
                badgeText="WHY OKJTECH?"
                title="Why Choose Our Expertise?"
                subtitle="Our approach is built on rigour, transparency, and measurable impact."
                contentMaxWidth="max-w-[1400px]"
            >
                <SectionCard>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        {benefits.map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-4 bg-black/20 p-8 border border-white/5 hover:border-primary/40 rounded-2xl transition-all group"
                            >
                                <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 shrink-0" />
                                <span className="text-white/85 font-light text-sm">{benefit}</span>
                            </motion.div>
                        ))}
                    </div>
                </SectionCard>
            </ParallaxSection>

            {/* Related Services */}
            {relatedServices && relatedServices.length > 0 && (
                <ParallaxSection
                    id="service-related"
                    bgMedia="/assets/videos/services/all-services-video.mp4"
                    heightClass="min-h-[170vh]"
                    badgeText="EXPLORE MORE"
                    title={`Other ${service.category} Services`}
                    contentMaxWidth="max-w-[1400px]"
                >
                    <SectionCard>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                            {relatedServices.map((rs: any) => (
                                <Link key={rs.id} href={`/services/${rs.slug}`} className="group block bg-black/20 p-8 border border-white/5 rounded-2xl hover:border-primary/45 hover:bg-black/40 transition-all">
                                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors mb-4">{rs.title}</h3>
                                    <p className="text-white/60 text-sm line-clamp-2">{rs.description}</p>
                                    <div className="mt-6 flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest">
                                        Explore <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>
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
                bgMedia="/assets/videos/services/all-services-video.mp4"
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

            <ParallaxNav sections={navSections} />
            <Footer />
        </main>
    )
}
