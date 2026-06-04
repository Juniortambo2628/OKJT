"use client"

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Mail } from 'lucide-react'
import Link from 'next/link'
import { useApi } from '@/hooks/use-api'


const CTABanner = () => {
    const { data: settingsByGroup } = useApi('/settings')
    const { scrollY } = useScroll()
    const backgroundY = useTransform(scrollY, [0, 5000], [0, -60])

    // Helper to get setting value
    const getSetting = (key: string, defaultValue: string) => {
        if (!settingsByGroup) return defaultValue
        const allSettings = Object.values(settingsByGroup).flat() as any[]
        const setting = allSettings.find(s => s.key === key)
        return setting?.value || defaultValue
    }

    const badgeText = getSetting('cta_badge', 'Currently accepting new projects')
    const title = getSetting('cta_title', 'Ready to bring your\nnext project to life?')
    const subtitle = getSetting('cta_subtitle', 'Whether you need a custom web app, a design overhaul, or a scalable digital platform — our engineering team is ready to deliver.')

    return (
        <section className="w-full relative overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#14110b] via-[#262115] to-[#14110b] z-0" />

            {/* Animated gold accent orbs */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl"
                animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/8 blur-3xl"
                animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Dot Pattern */}
            <div className="absolute top-0 left-0 w-full h-full z-[1] opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(235,200,130,0.5) 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                }} />

            <div className="max-w-[1400px] mx-auto px-6 py-28 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full px-6 py-2 mb-8"
                    >
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-primary text-sm font-medium">{badgeText}</span>
                    </motion.div>

                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 whitespace-pre-line">
                        {title}
                    </h2>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto mb-14 leading-relaxed">
                        {subtitle}
                    </p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-5"
                    >
                        <Button
                            size="lg"
                            className="h-14 px-10 text-base font-bold rounded-none bg-primary text-[#14110b] hover:bg-primary/90 transition-all hover:scale-[1.03] active:scale-[0.98] group shadow-2xl shadow-primary/20"
                            asChild
                        >
                            <Link href="/contact">
                                Start Your Project
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 px-10 text-base font-bold rounded-none border-primary/30 text-primary hover:bg-primary/10 backdrop-blur-sm transition-all group"
                            asChild
                        >
                            <Link href="/portfolio">
                                View Our Work
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="h-14 px-10 text-base font-bold rounded-none text-white/60 hover:text-primary hover:bg-primary/5 transition-all"
                            asChild
                        >
                            <Link href="/contact">
                                <Mail className="mr-2 h-5 w-5" />
                                Get a Free Quote
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}


export default CTABanner
