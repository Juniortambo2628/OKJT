"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Mail } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'
import ParallaxSection from '@/components/ParallaxSection'
import PrimaryButton from '@/components/PrimaryButton'
import FadeIn from '@/components/animations/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger'

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
            <div className="text-center py-8 md:py-12">
                <FadeIn direction="down" distance={20} blur={false}>
                    <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full px-6 py-2 mb-12">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-primary text-sm font-medium">Ready to begin?</span>
                    </div>
                </FadeIn>

                <StaggerContainer className="flex flex-col sm:flex-row items-center justify-center gap-5" staggerDelay={0.08}>
                    <StaggerItem>
                        <PrimaryButton href="/contact" size="lg">
                            Start Your Project
                        </PrimaryButton>
                    </StaggerItem>
                    <StaggerItem>
                        <PrimaryButton href="/projects" variant="outline" size="lg">
                            View Our Work
                        </PrimaryButton>
                    </StaggerItem>
                    <StaggerItem>
                        <PrimaryButton href="/contact" variant="ghost" size="lg" showArrow={false}>
                            <Mail className="mr-2 h-5 w-5" />
                            Get a Free Quote
                        </PrimaryButton>
                    </StaggerItem>
                </StaggerContainer>
            </div>
        </ParallaxSection>
    )
}

export default CTABanner
