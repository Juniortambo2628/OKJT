"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Mail } from 'lucide-react'
import Link from 'next/link'
import { useSettings } from '@/hooks/use-settings'
import ParallaxSection from '@/components/ParallaxSection'

const CTABanner = () => {
    const { getSetting } = useSettings()

    const badgeText = getSetting('cta_badge')
    const title = getSetting('cta_title')
    const subtitle = getSetting('cta_subtitle')

    return (
        <ParallaxSection
            id="cta"
            bgMedia="/assets/videos/services/international-diplomacy-video.mp4"
            heightClass="min-h-[170vh]"
            contentMaxWidth="max-w-[1400px]"
        >
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
                            <Link href="/projects">
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
        </ParallaxSection>
    )
}

export default CTABanner
