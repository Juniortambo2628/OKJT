"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Clock, Tag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { readingTime } from '@/lib/reading-time'
import SocialShare from '@/components/SocialShare'
import PageHero from '@/components/PageHero'
import { SectionSkeleton } from '@/components/MediaSkeleton'
import ParallaxSection from '@/components/ParallaxSection'
import ParallaxNav from '@/components/ParallaxNav'

export default function InsightDetailContent({ slug }: { slug: string }) {
    const { data: insight, isLoading, isError } = useApi(`/insights/${slug}`)
    const { data: allInsights } = useApi('/insights')

    const relatedInsights = allInsights?.filter((i: any) => i.slug !== slug && i.category === insight?.category).slice(0, 3)

    if (isLoading) {
        return (
            <main className="flex min-h-screen flex-col bg-background w-full overflow-x-clip">
                <Navbar />
                <SectionSkeleton />
                <Footer />
            </main>
        )
    }

    if (isError || !insight) {
        return (
            <main className="flex min-h-screen flex-col bg-background w-full overflow-x-clip">
                <Navbar />
                <div className="flex-1 flex items-center justify-center pt-32">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-foreground mb-4">Article Not Found</h1>
                        <Button asChild variant="outline"><Link href="/insights">Back to Insights</Link></Button>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    const timeToRead = readingTime(insight.content || '')

    const navSections = [
        { id: 'insight-hero', label: 'Intro' },
        { id: 'insight-content', label: 'Article' },
        ...(relatedInsights && relatedInsights.length > 0 ? [{ id: 'insight-related', label: 'Related' }] : []),
    ]

    return (
        <main className="flex min-h-screen flex-col bg-background w-full overflow-x-clip">
            <Navbar />

            <PageHero
                id="insight-hero" 
                title={insight.title}
                breadcrumbs={[
                    { label: 'Insights', href: '/insights' },
                    { label: insight.title }
                ]}
            >
                <div className="flex items-center gap-6 mb-8 text-[10px] font-bold uppercase tracking-widest mt-8">
                    {insight.category && (
                        <span className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
                            <Tag className="h-3 w-3" /> {insight.category}
                        </span>
                    )}
                    {insight.created_at && (
                        <span className="flex items-center gap-2 text-muted-foreground/60">
                            <Clock className="h-3 w-3" /> {new Date(insight.created_at).toLocaleDateString()}
                        </span>
                    )}
                    <span className="flex items-center gap-2 text-muted-foreground/60 italic">
                        {timeToRead} min read
                    </span>
                </div>
                
                <div className="flex items-center gap-6 pt-8 border-t border-border/50">
                    <SocialShare title={insight.title} slug={slug} type="insights" />
                </div>
            </PageHero>

            <div className="bg-black w-full overflow-visible">
            {/* Content */}
            <ParallaxSection
                id="insight-content"
                bgMedia="/assets/videos/services/fintech-video.mp4"
                heightClass="min-h-[250vh]"
                overlayOpacity={0.8}
                contentMaxWidth="max-w-[900px]"
            >
                    <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 md:p-12 w-full">
                        <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-white/80 prose-strong:text-white prose-a:text-primary">
                            <div dangerouslySetInnerHTML={{ __html: insight.content || '' }} />
                        </div>

                        <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h4 className="text-white font-bold text-xl mb-2">Interested in more?</h4>
                                <p className="text-white/60">Subscribe to our monthly newsletter for direct advisory highlights.</p>
                            </div>
                            <Button asChild size="lg" className="rounded-none px-10 bg-primary text-primary-foreground hover:bg-primary/90">
                                <Link href="/contact">Subscribe Now</Link>
                            </Button>
                        </div>
                    </div>
            </ParallaxSection>

            {/* Related Content */}
            {relatedInsights && relatedInsights.length > 0 && (
                <ParallaxSection
                    id="insight-related"
                    bgMedia="/assets/videos/services/energy-advisory.mp4"
                    heightClass="min-h-[200vh]"
                    badgeText="EXPLORE MORE"
                    title="Related Insights"
                    contentMaxWidth="max-w-[1400px]"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
                        {relatedInsights.map((ri: any) => (
                            <motion.div
                                key={ri.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                            >
                                <Link href={`/insights/${ri.slug}`} className="group block">
                                    <div className="relative h-48 mb-6 overflow-hidden border border-white/10 group-hover:border-primary/40 transition-colors bg-black/30 backdrop-blur-sm rounded-xl">
                                        {ri.image ? (
                                            <Image src={ri.image} alt={ri.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20">NI</div>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                        {ri.title}
                                    </h3>
                                    <p className="text-white/60 text-sm line-clamp-2">{ri.excerpt?.replace(/<[^>]*>?/gm, '')}</p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-10">
                        <Button variant="outline" className="rounded-none border-primary/30 text-primary hover:bg-primary/10" asChild>
                            <Link href="/insights">
                                View Full Library <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </ParallaxSection>
            )}
            </div>

            <ParallaxNav sections={navSections} />
            <Footer />
        </main>
    )
}
