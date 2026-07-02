"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApi } from '@/hooks/use-api'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import FadeIn from '@/components/animations/FadeIn'

const TestimonialsSection = () => {
    const { data: testimonials, isLoading, isError } = useApi('/testimonials')
    const [current, setCurrent] = useState(0)
    const [autoplay, setAutoplay] = useState(true)

    const items = testimonials || []

    const next = useCallback(() => {
        if (items.length > 0) setCurrent((prev) => (prev + 1) % items.length)
    }, [items.length])

    const prev = useCallback(() => {
        if (items.length > 0) setCurrent((prev) => (prev - 1 + items.length) % items.length)
    }, [items.length])

    useEffect(() => {
        if (!autoplay || items.length === 0) return
        const timer = setInterval(next, 6000)
        return () => clearInterval(timer)
    }, [autoplay, next, items.length])

    if (isLoading || isError || items.length === 0) return null

    const t = items[current]

    return (
        <section className="w-full py-32 bg-[#050a1a] relative overflow-hidden">
            {/* Subtle Background */}
            <div className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                    backgroundSize: '48px 48px',
                }} />

            <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                {/* Header */}
                <FadeIn className="text-center mb-20" direction="up" distance={24}>
                    <span className="text-primary font-bold text-sm uppercase tracking-[0.2em] mb-4 block">
                        Client Testimonials
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        What our clients say
                    </h2>
                    <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
                </FadeIn>

                {/* Testimonial Carousel */}
                <div
                    className="relative"
                    onMouseEnter={() => setAutoplay(false)}
                    onMouseLeave={() => setAutoplay(true)}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, x: 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -60 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                        >
                            {/* Quote Icon */}
                            <Quote className="h-10 w-10 text-primary/30 mx-auto mb-8" />

                            {/* Quote Text */}
                            <blockquote className="text-xl md:text-2xl lg:text-3xl text-white/80 font-light leading-relaxed max-w-4xl mx-auto mb-10 italic">
                                &ldquo;{t.quote}&rdquo;
                            </blockquote>

                            {/* Stars */}
                            <div className="flex items-center justify-center gap-1 mb-6">
                                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            {/* Author */}
                            <div>
                                <div className="text-white font-bold text-lg">{t.name}</div>
                                <div className="text-white/40 text-sm">
                                    {t.role}, <span className="text-primary/60">{t.company}</span>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-6 mt-12">
                        <button
                            onClick={prev}
                            className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        {/* Dots */}
                        <div className="flex items-center gap-2">
                            {items.map((_: any, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`h-2 transition-all ${
                                        i === current
                                            ? 'w-8 bg-primary'
                                            : 'w-2 bg-white/20 hover:bg-white/40'
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={next}
                            className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TestimonialsSection
