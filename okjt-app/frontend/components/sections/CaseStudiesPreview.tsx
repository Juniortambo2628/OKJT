"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApi } from '@/hooks/use-api'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight } from 'lucide-react'


import { Button } from '@/components/ui/button'
import Link from 'next/link'

const CaseStudiesPreview = () => {
    const { data: caseStudies, isLoading, isError } = useApi('/case-studies')
    const [activeIndex, setActiveIndex] = useState(0)

    if (isLoading) return <div className="py-20 text-center text-slate-400">Loading case studies...</div>
    if (isError || !caseStudies || caseStudies.length === 0) return null

    const activeCS = caseStudies[activeIndex]

    return (
        <section className="w-full py-32 bg-background relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6"
                >
                    <div>
                        <span className="text-primary font-bold text-sm uppercase tracking-[0.2em] mb-4 block">
                            Technical Excellence
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-foreground">
                            Engineering that scales.
                        </h2>
                    </div>
                    <Button variant="outline" className="rounded-none border-border text-muted-foreground font-bold hover:border-primary hover:text-primary" asChild>
                        <Link href="/portfolio">
                            View Full Portfolio <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </motion.div>

                {/* Interactive Layout: Tabs + Featured Case Study */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Tab List */}
                    <div className="lg:col-span-4 space-y-4">
                        {caseStudies.map((cs: any, index: number) => (
                            <motion.button
                                key={cs.id}
                                onClick={() => setActiveIndex(index)}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`w-full text-left p-6 border transition-all ${
                                    activeIndex === index
                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                                        : 'border-border/50 hover:border-primary/30 bg-card'
                                }`}
                            >
                                <span className={`text-[10px] font-bold uppercase tracking-widest block mb-2 ${
                                    activeIndex === index ? 'text-primary' : 'text-slate-400'
                                }`}>
                                    {cs.significant_figure || 'Case Study'}
                                </span>
                                <h3 className={`font-bold text-base ${
                                    activeIndex === index ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                    {cs.title}
                                </h3>
                            </motion.button>
                        ))}
                    </div>

                    {/* Featured Case Study */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCS.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="h-full"
                            >
                                <div className="relative h-full min-h-[500px] group overflow-hidden">
                                    {/* Image */}
                                    {activeCS.image ? (
                                        <Image
                                            src={activeCS.image}
                                            alt={activeCS.title}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 66vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-300">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    {/* Content Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-10 z-10">
                                        <span className="text-primary/80 text-xs font-bold uppercase tracking-widest mb-2 block">
                                            {activeCS.client_name}
                                        </span>
                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                            {activeCS.title}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div>
                                                <span className="text-primary/80 text-[10px] font-bold uppercase tracking-widest block mb-1">Challenge</span>
                                                <p className="text-white/60 text-sm leading-relaxed line-clamp-3">{activeCS.problem}</p>
                                            </div>
                                            <div className="bg-emerald-500/10 border border-emerald-400/20 p-4">
                                                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Outcome</span>
                                                <p className="text-emerald-200 text-sm leading-relaxed">{activeCS.outcome}</p>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/portfolio/${activeCS.slug}`}
                                            className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 group/link hover:text-primary transition-colors"
                                        >
                                            Explore Innovation
                                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    )
}


export default CaseStudiesPreview
