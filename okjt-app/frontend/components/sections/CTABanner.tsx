"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Mail } from 'lucide-react'
import Link from 'next/link'
import { useSettings } from '@/hooks/use-settings'
import ParallaxSection from '@/components/ParallaxSection'
import { SectionCard } from '@/components/ui/SectionCard'

const CTABanner = () => {
    const { getSetting } = useSettings()

    const badgeText = getSetting('cta_badge')
    const title = getSetting('cta_title')
    const subtitle = getSetting('cta_subtitle')

    const bgMedia = getSetting('bg_home_cta')

    return (
        <ParallaxSection
            id="cta"
            bgMedia={bgMedia}
            heightClass="min-h-[230vh]"
            contentMaxWidth="max-w-[1400px]"
            badgeText={badgeText}
            title={title}
            subtitle={subtitle}
        >
            <SectionCard className="text-center py-16 md:py-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full px-6 py-2 mb-12"
                >
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-primary text-sm font-medium">Ready to begin?</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-5"
                >
                    <Button
                        size="lg"
                        className="h-14 px-10 text-base font-bold bg-primary text-[#14110b] hover:bg-primary/90 transition-all hover:scale-[1.03] active:scale-[0.98] group shadow-2xl shadow-primary/20"
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
                        className="h-14 px-10 text-base font-bold border-primary/30 text-primary hover:bg-primary/10 backdrop-blur-sm transition-all group"
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
                        className="h-14 px-10 text-base font-bold text-foreground/60 hover:text-primary hover:bg-primary/5 transition-all"
                        asChild
                    >
                        <Link href="/contact">
                            <Mail className="mr-2 h-5 w-5" />
                            Get a Free Quote
                        </Link>
                    </Button>
                </motion.div>
            </SectionCard>
        </ParallaxSection>
    )
}

export default CTABanner
