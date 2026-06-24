"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApi } from '@/hooks/use-api'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SectionSkeleton } from '@/components/MediaSkeleton'

import { Card } from '@/components/ui/card'

const ProjectsPreview = () => {
    const { data: projects, isLoading, isError } = useApi('/projects')
    const [activeIndex, setActiveIndex] = useState(0)

    if (isLoading) return <SectionSkeleton />
    if (isError || !projects || projects.length === 0) return null

    const clientProjects = projects.filter((p: any) => p.type === 'client')
    if (clientProjects.length === 0) return null

    const activeProject = clientProjects[activeIndex]

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
                        <Link href="/projects">
                            View All Projects <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </motion.div>

                {/* Interactive Layout: Tabs + Featured Project */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Tab List */}
                    <div className="lg:col-span-4 space-y-4">
                        {clientProjects.map((p: any, index: number) => (
                            <motion.button
                                key={p.id}
                                onClick={() => setActiveIndex(index)}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="w-full block"
                            >
                                <Card className={`text-left p-5 transition-all duration-300 border ${
                                    activeIndex === index
                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                                        : 'border-border/50 hover:border-primary/30'
                                }`}>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest block mb-2 ${
                                        activeIndex === index ? 'text-primary' : 'text-slate-400'
                                    }`}>
                                        {p.significant_figure || 'Project'}
                                    </span>
                                    <h3 className={`font-bold text-base ${
                                        activeIndex === index ? 'text-foreground' : 'text-muted-foreground'
                                    }`}>
                                        {p.title}
                                    </h3>
                                </Card>
                            </motion.button>
                        ))}
                    </div>

                    {/* Featured Project */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeProject.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="h-full"
                            >
                                <Card className="relative h-full min-h-[500px] group overflow-hidden border-none rounded-[1.8rem]">
                                    {/* Image */}
                                    {activeProject.image ? (
                                        <Image
                                            src={activeProject.image}
                                            alt={activeProject.title}
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
                                    <div className="absolute inset-x-0 bottom-0 p-8 z-10">
                                        <span className="text-primary/80 text-xs font-bold uppercase tracking-widest mb-2 block">
                                            {activeProject.client_name}
                                        </span>
                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                            {activeProject.title}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div>
                                                <span className="text-primary/80 text-[10px] font-bold uppercase tracking-widest block mb-1">Challenge</span>
                                                <p className="text-white/60 text-sm leading-relaxed line-clamp-3">{activeProject.problem}</p>
                                            </div>
                                            <div className="bg-emerald-500/10 border border-emerald-400/20 p-4 rounded-xl">
                                                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Outcome</span>
                                                <p className="text-emerald-200 text-sm leading-relaxed">{activeProject.outcome}</p>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/projects/${activeProject.slug}`}
                                            className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 group/link hover:text-primary transition-colors"
                                        >
                                            Explore Innovation
                                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                                        </Link>
                                    </div>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProjectsPreview