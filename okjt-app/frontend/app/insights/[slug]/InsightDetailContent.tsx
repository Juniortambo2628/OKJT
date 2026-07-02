"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Clock, Tag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { readingTime } from '@/lib/reading-time'
import SocialShare from '@/components/SocialShare'
import Hero from '@/components/Hero'
import { SectionSkeleton } from '@/components/MediaSkeleton'
import ParallaxSection from '@/components/ParallaxSection'
import { SectionCard } from '@/components/ui/SectionCard'
import { useSettings } from '@/hooks/use-settings'
import { PageShell } from '@/components/PageShell'
import { INSIGHT_DETAIL_NAV_SECTIONS, type NavSection } from '@/lib/nav-sections'
import { Insight } from '@/types/api'

export default function InsightDetailContent({ slug }: { slug: string }) {
    const { getSetting } = useSettings()
    const { data: insight, isLoading, isError } = useApi<Insight>(`/insights/${slug}`)
    const { data: allInsights } = useApi<Insight[]>('/insights')

    const bgContent = getSetting('bg_insight_content')
    const bgRelated = getSetting('bg_insight_related')

    const relatedInsights = allInsights?.filter((i) => i.slug !== slug && i.category === insight?.category).slice(0, 3)

    const navSections: NavSection[] = [
        ...INSIGHT_DETAIL_NAV_SECTIONS,
        ...(relatedInsights && relatedInsights.length > 0 ? [{ id: 'insight-related', label: 'Related' }] : []),
    ]

    if (isLoading) {
        return (
            <PageShell>
                <SectionSkeleton />
            </PageShell>
        )
    }

    if (isError || !insight) {
        return (
            <PageShell>
                <div className="flex-1 flex items-center justify-center pt-32">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-foreground mb-4">Article Not Found</h1>
                        <Button asChild variant="outline"><Link href="/insights">Back to Insights</Link></Button>
                    </div>
                </div>
            </PageShell>
        )
    }

    const timeToRead = readingTime(insight.content || '')

    return (
        <PageShell navSections={navSections}>
            <Hero
                id="insight-hero"
                tagline={insight.category ?? undefined}
                title={insight.title}
                subtitle={insight.excerpt?.replace(/<[^>]*>?/gm, '').substring(0, 180)}
                breadcrumbs={[
                    { label: 'Insights', href: '/insights' },
                    { label: insight.title }
                ]}
            >
                <div className="flex flex-wrap items-center gap-4 mb-6 text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                    {insight.created_at && (
                        <span className="flex items-center gap-2">
                            <Clock className="h-3 w-3" /> {new Date(insight.created_at).toLocaleDateString()}
                        </span>
                    )}
                    <span className="flex items-center gap-2 italic">
                        {timeToRead} min read
                    </span>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                    <SocialShare title={insight.title} slug={slug} type="insights" />
                </div>
            </Hero>

            <div className="bg-black w-full overflow-visible">
            {/* Content */}
            <ParallaxSection
                id="insight-content"
                bgMedia={bgContent}
                heightClass="min-h-[250vh]"
                overlayOpacity={0.8}
                contentMaxWidth="max-w-[900px]"
            >
                <SectionCard>
                    <div className="bg-black/20 border border-white/5 rounded-2xl p-8 md:p-12 w-full">
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
                </SectionCard>
            </ParallaxSection>

            {/* Related Content */}
            {relatedInsights && relatedInsights.length > 0 && (
                <ParallaxSection
                    id="insight-related"
                    bgMedia={bgRelated}
                    heightClass="min-h-[200vh]"
                    badgeText="EXPLORE MORE"
                    title="Related Insights"
                    contentMaxWidth="max-w-[1400px]"
                >
                    <SectionCard>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                            {relatedInsights.map((ri) => (
                                <motion.div
                                    key={ri.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                >
                                    <Link href={`/insights/${ri.slug}`} className="group block h-full">
                                        <div className="relative h-48 mb-6 overflow-hidden border border-white/10 group-hover:border-primary/40 transition-colors bg-black/20 rounded-xl">
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
                    </SectionCard>
                </ParallaxSection>
            )}
            </div>
        </PageShell>
    )
}
