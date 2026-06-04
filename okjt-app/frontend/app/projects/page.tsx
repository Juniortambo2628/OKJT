"use client"

import React from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/use-api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import { motion } from 'framer-motion'
import { ExternalLink, ArrowRight, Star } from 'lucide-react'
import Image from 'next/image'
import { Innovation } from '@/types/api'
import SkeletonCard from '@/components/SkeletonCard'
import { Button } from '@/components/ui/button'
import { getMediaUrl } from '@/lib/utils'

export default function FlagshipProjectsPage() {
    const { data: innovations, isLoading } = useApi<Innovation[]>('/innovations')
    
    const featured = innovations?.filter(i => i.is_active) || []

    return (
        <main className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <PageHero
                centered
                tagline="Flagship Innovations"
                title="Engineering the <br />Future of Digital."
                subtitle="Explore our bespoke flagship projects—highly specialized digital products built for scale, performance, and maximum impact."
                bgImage="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80"
            />

            <section className="py-24 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    {isLoading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <SkeletonCard variant="grid" count={2} />
                        </div>
                    )}

                    {!isLoading && featured.length === 0 && (
                        <div className="text-center py-40 border-2 border-dashed border-border rounded-3xl">
                            <p className="text-muted-foreground text-xl">Our flagship projects are currently being synchronized.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-24">
                        {featured.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-20 items-center`}
                            >
                                {/* Media Container */}
                                <div className="w-full md:w-1/2 relative group">
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                                        {item.image ? (
                                            <Image
                                                src={getMediaUrl(item.image)}
                                                alt={item.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                                                <Star size={64} className="text-primary/20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    </div>
                                    
                                    {/* Project Number */}
                                    <div className="absolute -top-6 -left-6 md:-left-12 text-[10rem] font-bold text-primary/5 select-none pointer-events-none">
                                        0{index + 1}
                                    </div>
                                </div>

                                {/* Content Container */}
                                <div className="w-full md:w-1/2 space-y-6">
                                    <div className="flex items-center gap-3">
                                        {item.is_featured && (
                                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-primary/20">
                                                <Star size={10} className="fill-primary" /> Featured
                                            </span>
                                        )}
                                        <span className="text-primary font-mono text-xs font-bold uppercase tracking-[0.3em]">Flagship Project</span>
                                    </div>
                                    
                                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                                        {item.title}
                                    </h2>
                                    
                                    {item.tagline && (
                                        <p className="text-xl font-bold text-primary/80 italic">
                                            "{item.tagline}"
                                        </p>
                                    )}

                                    <div 
                                        className="text-muted-foreground text-lg leading-relaxed prose prose-invert"
                                        dangerouslySetInnerHTML={{ __html: item.description || '' }}
                                    />

                                    <div className="flex flex-wrap items-center gap-6 pt-6">
                                        {item.url && (
                                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-[#14110b] font-bold h-14 px-8 rounded-none transition-all hover:scale-105 active:scale-95" asChild>
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                    Launch Product <ExternalLink size={18} />
                                                </a>
                                            </Button>
                                        )}
                                        <Button variant="link" className="text-foreground hover:text-primary p-0 h-auto font-bold uppercase tracking-widest text-xs group" asChild>
                                            <Link href={`/projects/${item.slug}`}>
                                                Full Case Study
                                                <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-2" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
