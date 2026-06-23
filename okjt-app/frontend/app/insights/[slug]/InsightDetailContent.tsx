"use client"

import React from 'react'
import { useApi } from '@/hooks/use-api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Clock, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { readingTime } from '@/lib/reading-time'
import SocialShare from '@/components/SocialShare'
import PageHero from '@/components/PageHero'
import { SectionSkeleton } from '@/components/MediaSkeleton'

export default function InsightDetailContent({ slug }: { slug: string }) {
    const { data: insight, isLoading, isError } = useApi(`/insights/${slug}`)
    const { data: allInsights } = useApi('/insights')

    const relatedInsights = allInsights?.filter((i: any) => i.slug !== slug && i.category === insight?.category).slice(0, 3)

    if (isLoading) {
        return (
            <main className="flex min-h-screen flex-col bg-background">
                <Navbar />
                <SectionSkeleton />
                <Footer />
            </main>
        )
    }

    if (isError || !insight) {
        return (
            <main className="flex min-h-screen flex-col bg-background">
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

    return (
        <main className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <PageHero 
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

            {/* Content */}
            <section className="py-24 bg-background">
                <div className="max-w-[900px] mx-auto px-6">
                    <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
                        <div dangerouslySetInnerHTML={{ __html: insight.content || '' }} />
                    </div>

                    <div className="mt-20 pt-10 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h4 className="text-foreground font-bold text-xl mb-2">Interested in more?</h4>
                            <p className="text-muted-foreground">Subscribe to our monthly newsletter for direct advisory highlights.</p>
                        </div>
                        <Button asChild size="lg" className="rounded-none px-10">
                            <Link href="/contact">Subscribe Now</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Related Content */}
            {relatedInsights && relatedInsights.length > 0 && (
                <section className="py-24 bg-secondary/10 border-t border-border/50">
                    <div className="max-w-[1200px] mx-auto px-6">
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Related Insights</h2>
                            <Link href="/insights" className="text-primary text-sm font-bold uppercase tracking-widest hover:underline">
                                View Library
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedInsights.map((ri: any) => (
                                <Link key={ri.id} href={`/insights/${ri.slug}`} className="group block">
                                    <div className="relative h-48 mb-6 overflow-hidden border border-border/50 group-hover:border-primary/40 transition-colors bg-card">
                                        {ri.image ? (
                                            <Image src={ri.image} alt={ri.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full bg-secondary/20 flex items-center justify-center text-muted-foreground/20">NI</div>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                        {ri.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm line-clamp-2">{ri.excerpt?.replace(/<[^>]*>?/gm, '')}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </main>
    )
}
