"use client"

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useApi } from '@/hooks/use-api'
import { ArrowRight, ArrowUpRight, Clock, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SectionSkeleton } from '@/components/MediaSkeleton'

import { Card } from '@/components/ui/card'

const InsightsSection = () => {
    const { data: insights, isLoading, isError } = useApi('/insights')

    if (isLoading) return <SectionSkeleton />
    if (isError || !insights || insights.length === 0) {
        return (
            <section id="insights" className="w-full py-32 bg-secondary/20 relative">
                <div className="max-w-[1400px] mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
                        <span className="text-primary font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Technical Insights</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8">Latest Articles & News</h2>
                        <p className="text-muted-foreground">The latest research notes and advisory updates will appear here as they are published.</p>
                    </motion.div>
                </div>
            </section>
        )
    }

    const featured = insights[0]
    const rest = insights.slice(1, 4)

    return (
        <section id="insights" className="w-full py-32 bg-secondary/20 relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6"
                >
                    <div>
                        <span className="text-primary font-bold text-sm uppercase tracking-[0.2em] mb-4 block">
                            Technical Insights
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-foreground">
                            Latest Articles & News
                        </h2>
                    </div>
                    <Button variant="outline" className="rounded-none border-border text-muted-foreground font-bold hover:border-primary hover:text-primary" asChild>
                        <Link href="/insights">
                            View All <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </motion.div>

                {/* Featured + Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Featured Insight - Large */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                    >
                        <Link href={`/insights/${featured.slug}`} className="block group h-full">
                            <Card className="relative h-full min-h-[500px] overflow-hidden border-none rounded-[1.8rem]">
                                {featured.image && (
                                    <Image
                                        src={featured.image}
                                        alt={featured.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                )}
                                {!featured.image && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-900/20" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                <div className="absolute inset-x-0 bottom-0 p-8 z-10">
                                    <div className="flex items-center gap-4 mb-4 text-xs text-white/50">
                                        {featured.category && (
                                            <span className="bg-primary/80 text-white px-3 py-1 font-bold uppercase tracking-wider">
                                                {featured.category}
                                            </span>
                                        )}
                                        {featured.created_at && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {new Date(featured.created_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-primary/90 transition-colors line-clamp-3">
                                        {featured.title}
                                    </h3>
                                    <p className="text-white/60 text-sm leading-relaxed line-clamp-2 mb-4">
                                        {featured.excerpt || featured.content?.substring(0, 150)}
                                    </p>
                                    <span className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 group-hover:text-primary transition-colors">
                                        Read More <ArrowUpRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </Card>
                        </Link>
                    </motion.div>

                    {/* Stacked Smaller Insights */}
                    <div className="space-y-6 flex flex-col">
                        {rest.map((insight: any, index: number) => (
                            <motion.div
                                key={insight.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex-1"
                            >
                                <Link href={`/insights/${insight.slug}`} className="block group h-full">
                                    <Card className="flex gap-6 p-5 h-full hover:shadow-lg hover:border-primary/20 transition-all">
                                        {insight.image && (
                                            <div className="relative w-32 h-auto shrink-0 overflow-hidden rounded-xl hidden sm:block">
                                                <Image
                                                    src={insight.image}
                                                    alt={insight.title}
                                                    fill
                                                    sizes="128px"
                                                    className="object-cover transition-transform group-hover:scale-110 duration-500"
                                                />
                                            </div>
                                        )}
                                        <div className="flex flex-col justify-center flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 text-[11px] text-muted-foreground">
                                                {insight.category && (
                                                    <span className="text-primary font-bold uppercase tracking-wider">{insight.category}</span>
                                                )}
                                                {insight.created_at && (
                                                    <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                                {insight.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm line-clamp-2">
                                                {insight.excerpt || insight.content?.substring(0, 100)}
                                            </p>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default InsightsSection
