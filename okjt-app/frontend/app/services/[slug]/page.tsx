"use client"

import React from 'react'
import { useParams } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import { useSettings } from '@/hooks/use-settings'

const categoryVideos: Record<string, string> = {
    'Energy Advisory': 'https://cdn.pixabay.com/video/2020/06/01/40662-426613619_large.mp4',
    'Fintech': 'https://cdn.pixabay.com/video/2016/09/13/5225-183424629_large.mp4',
    'International Diplomacy': 'https://cdn.pixabay.com/video/2019/04/23/23011-332308064_large.mp4',
}

const benefits = [
    'Data-driven insights tailored to your market',
    'Experienced advisory team with deep sector knowledge',
    'Transparent methodology and clear deliverables',
    'Proven track record of measurable outcomes',
    'End-to-end support from analysis to execution',
]

export default function ServiceDetailPage() {
    const params = useParams()
    const slug = params?.slug as string
    const { getSetting } = useSettings()
    const { data: service, isLoading, isError } = useApi(slug ? `/services/${slug}` : null)
    const { data: allServices } = useApi('/services')

    const relatedServices = allServices?.filter((s: any) => s.slug !== slug && s.category === service?.category).slice(0, 3)

    if (isLoading) {
        return (
            <main className="flex min-h-screen flex-col bg-background">
                <Navbar />
                <div className="flex-1 flex items-center justify-center pt-32">
                    <div className="text-white/50 text-lg animate-pulse">Mapping service architecture...</div>
                </div>
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

    const mediaUrl = service.image || service.pillar?.image || 'https://cdn.pixabay.com/video/2021/09/20/89324-609800721_large.mp4'
    const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm')

    return (
        <main className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <PageHero
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

            {/* Service Detail Content */}
            <section className="py-24 bg-background">
                <div className="max-w-[1000px] mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="prose prose-invert lg:prose-xl max-w-none"
                    >
                        <div 
                            className="text-muted-foreground leading-relaxed text-lg mb-12 prose-p:leading-relaxed prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: service.content || service.description || '' }} 
                        />
                    </motion.div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-24 bg-background border-y border-border/50">
                <div className="max-w-[1400px] mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Why OKJTech?
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto italic">
                            Our approach is built on rigour, transparency, and measurable impact.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-4 bg-card p-8 border border-border/50 hover:border-primary/40 transition-colors"
                            >
                                <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 shrink-0" />
                                <span className="text-muted-foreground font-light">{benefit}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Related Services */}
            {relatedServices && relatedServices.length > 0 && (
                <section className="py-24 bg-secondary/20">
                    <div className="max-w-[1400px] mx-auto px-6">
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-2xl font-bold text-foreground">Other {service.category} Services</h2>
                            <Link href="/services" className="text-primary text-sm font-bold uppercase tracking-widest hover:underline">
                                View All Services
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedServices.map((rs: any) => (
                                <Link key={rs.id} href={`/services/${rs.slug}`} className="group block bg-card p-8 border border-border/50 hover:border-primary/40 transition-all">
                                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-4">{rs.title}</h3>
                                    <p className="text-muted-foreground text-sm line-clamp-2">{rs.description}</p>
                                    <div className="mt-6 flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest">
                                        Explore <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-24 bg-primary">
                <div className="max-w-[1400px] mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
                            Empower your next strategic move.
                        </h2>
                        <p className="text-white/80 max-w-xl mx-auto mb-12 text-xl font-light">
                            Connect with our advisory team to discuss how we can support your objectives in {service.category}.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                            <Button
                                size="lg"
                                className="h-16 px-12 text-lg font-bold rounded-none bg-white text-primary hover:bg-white/90 group"
                                asChild
                            >
                                <Link href="/contact">
                                    Book a Consultation
                                    <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
