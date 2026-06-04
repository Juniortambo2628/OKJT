"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Code2, Palette, LineChart } from 'lucide-react'
import { useApi } from '@/hooks/use-api'

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.2 }
    }
}

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring" as const, stiffness: 80, damping: 20 }
    }
}

const ValueProposition = () => {
    const { data: settingsByGroup } = useApi('/settings')
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const { scrollY } = useScroll()
    const sectionScale = useTransform(scrollY, [200, 900], [0.95, 1])
    const sectionOpacity = useTransform(scrollY, [200, 600], [0.7, 1])

    // Helper to get setting value
    const getSetting = (key: string, defaultValue: string) => {
        if (!settingsByGroup) return defaultValue
        const allSettings = Object.values(settingsByGroup).flat() as any[]
        const setting = allSettings.find(s => s.key === key)
        return setting?.value || defaultValue
    }

    const tagline = getSetting('vp_section_tagline', 'What We Do')
    const title = getSetting('vp_section_title', 'Three Pillars of\nDigital Craftsmanship')
    const subtitle = getSetting('vp_section_subtitle', 'We design, build, and ship production-grade web experiences — from first pixel to final deploy.')

    const pillars = [
        {
            title: getSetting('vp_pillar1_title', 'Custom Web Development'),
            description: getSetting('vp_pillar1_description', 'Full-stack web applications, e-commerce platforms, CMS solutions, and SaaS products — architected with Next.js, Laravel, and modern frameworks for performance at scale.'),
            icon: Code2,
            image: '/assets/images/custom-webdev.png',
            href: '/services',
            stats: getSetting('vp_pillar1_stats', '30+ Projects Delivered'),
            tag: getSetting('vp_pillar1_tag', 'Core Expertise'),
        },
        {
            title: getSetting('vp_pillar2_title', 'UI/UX Design'),
            description: getSetting('vp_pillar2_description', 'Design-led interfaces that delight users — from wireframes and prototypes to polished production design systems. We prioritize clarity, accessibility, and visual impact.'),
            icon: Palette,
            image: '/assets/images/uiux-design.png',
            href: '/services',
            stats: getSetting('vp_pillar2_stats', 'Pixel-perfect Delivery'),
            tag: getSetting('vp_pillar2_tag', 'Core Expertise'),
        },
        {
            title: getSetting('vp_pillar3_title', 'Digital Strategy'),
            description: getSetting('vp_pillar3_description', 'Technical consulting, architecture reviews, performance audits, and digital transformation roadmaps — helping businesses make confident technology decisions.'),
            icon: LineChart,
            image: '/assets/images/digital-strategy.png',
            href: '/services',
            stats: getSetting('vp_pillar3_stats', 'End-to-end Planning'),
            tag: getSetting('vp_pillar3_tag', 'Core Expertise'),
        },
    ]

    return (
        <motion.section className="w-full py-0 bg-background relative overflow-hidden" style={{ scale: sectionScale, opacity: sectionOpacity }}>
            {/* Section Header */}
            <div className="max-w-[1400px] mx-auto px-6 pt-24 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 60, damping: 20 }}
                    className="flex flex-col md:flex-row items-end justify-between gap-6"
                >
                    <div>
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-primary font-bold text-sm uppercase tracking-[0.2em] mb-4 block"
                        >
                            {tagline}
                        </motion.span>
                        <h2 className="text-3xl md:text-5xl font-bold text-foreground whitespace-pre-line">
                            {title}
                        </h2>
                    </div>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground max-w-md text-lg leading-relaxed"
                    >
                        {subtitle}
                    </motion.p>
                </motion.div>
            </div>

            {/* Pillar Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]"
            >
                {pillars.map((pillar, index) => {
                    const Icon = pillar.icon
                    return (
                        <motion.div
                            key={pillar.title}
                            variants={cardVariants}
                            className="relative group cursor-pointer overflow-hidden"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <Link href={pillar.href} className="block relative h-full min-h-[450px] md:min-h-[500px]">
                                {/* Background Image */}
                                <Image
                                    src={pillar.image}
                                    alt={pillar.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Gradient Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 transition-all duration-500" />
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-500" />

                                {/* Animated accent line */}
                                <motion.div
                                    className="absolute top-0 left-0 w-full h-[2px] bg-primary z-20"
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: hoveredIndex === index ? 1 : 0 }}
                                    transition={{ duration: 0.4 }}
                                    style={{ transformOrigin: 'left' }}
                                />

                                {/* Tag */}
                                <div className="absolute top-6 left-8 z-10">
                                    <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest px-4 py-2">
                                        {pillar.tag}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="absolute inset-x-0 bottom-0 p-8 z-10">
                                    {/* Icon */}
                                    <motion.div
                                        className="mb-6"
                                        whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                                    >
                                        <Icon className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110 drop-shadow-lg" />
                                    </motion.div>

                                    {/* Stats Pill */}
                                    <motion.span
                                        className="inline-block text-primary/70 text-xs font-bold uppercase tracking-widest mb-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"
                                    >
                                        {pillar.stats}
                                    </motion.span>

                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                                        {pillar.title}
                                    </h3>

                                    {/* Description - reveals on hover */}
                                    <div className="max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-500 ease-out">
                                        <p className="text-white/70 leading-relaxed mb-6">
                                            {pillar.description}
                                        </p>
                                    </div>

                                    {/* CTA */}
                                    <span className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-3 group-hover:text-primary transition-colors">
                                        Learn More
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                                    </span>

                                    {/* Bottom Accent Line */}
                                    <div className="w-0 group-hover:w-full h-[2px] bg-primary mt-6 transition-all duration-700" />
                                </div>
                            </Link>
                        </motion.div>
                    )
                })}
            </motion.div>
        </motion.section>
    )
}

export default ValueProposition
