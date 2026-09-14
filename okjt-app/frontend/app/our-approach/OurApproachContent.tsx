"use client"

import React, { useRef } from 'react'
import { useApi } from '@/hooks/use-api'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
// scroll-progress bar is rendered globally by ParallaxNav / BaseLayout
import { Pillar } from '@/types/api'
import { usePageHeroMedia } from '@/hooks/use-page-hero-media'
import { SkeletonBlock, SectionSkeleton } from '@/components/MediaSkeleton'
import BaseLayout from '@/components/BaseLayout'

const PillarSection = ({ pillar, index }: { pillar: Pillar, index: number }) => {
    const sectionRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"]
    })

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 26,
        mass: 0.5,
        restDelta: 0.001
    })

    const contentOpacity = useTransform(smoothProgress, [0.0, 0.04, 0.94, 1.0], [0, 1, 1, 0])
    const contentScale = useTransform(smoothProgress, [0.0, 0.04, 0.94, 1.0], [0.98, 1, 1, 0.97])
    const contentY = useTransform(smoothProgress, [0.0, 0.04, 0.94, 1.0], [28, 0, 0, -56])

    const subtitleOpacity = useTransform(smoothProgress, [0.0, 0.02, 0.08, 0.9, 0.98, 1.0], [0, 0, 1, 1, 0, 0])
    const subtitleY = useTransform(smoothProgress, [0.0, 0.02, 0.08, 0.9, 0.98, 1.0], [24, 24, 0, 0, -40, -40])

    const detailOpacity = useTransform(smoothProgress, [0.0, 0.04, 0.12, 0.86, 0.96, 1.0], [0, 0, 1, 1, 0, 0])
    const detailY = useTransform(smoothProgress, [0.0, 0.04, 0.12, 0.86, 0.96, 1.0], [32, 32, 0, 0, -48, -48])

    const bgImage = pillar.image
    const isVideo = bgImage?.endsWith('.mp4') || bgImage?.endsWith('.webm')

    return (
        <div id={`pillar-${pillar.slug}`} ref={sectionRef} className="relative min-h-[230vh] w-full overflow-visible">
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
                {/* Background Media */}
                <motion.div 
                    className="absolute inset-0 z-0"
                    style={{ 
                        scale: useTransform(smoothProgress, [0, 1], [1.02, 1.08]),
                        opacity: useTransform(smoothProgress, [0, 0.03, 1], [0, 1, 1]),
                        willChange: 'transform, opacity'
                    }}
                >
                    {bgImage ? (
                        isVideo ? (
                            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                                <source src={bgImage} type="video/mp4" />
                            </video>
                        ) : (
                            <img src={bgImage} alt={pillar.title} className="w-full h-full object-cover" />
                        )
                    ) : (
                        <SkeletonBlock className="h-full w-full" />
                    )}
                    <div className="absolute inset-0 bg-black/65" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/90" />
                    <div className="absolute inset-0 bg-primary/6 mix-blend-overlay" />
                </motion.div>

                <motion.div 
                    style={{ 
                        opacity: contentOpacity, 
                        scale: contentScale,
                        y: contentY,
                        willChange: 'transform, opacity'
                    }}
                    className="relative z-10 w-full max-w-4xl px-4 flex items-center justify-center pointer-events-auto"
                >
                    <div className="w-full text-center flex flex-col items-center justify-center space-y-6 sm:space-y-8 select-none">
                        <span className="inline-block bg-white/10 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full text-primary font-bold tracking-[0.25em] uppercase text-[10px] sm:text-xs shadow-sm select-none">
                            APPROACH 0{index + 1}
                        </span>
                        
                        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-3xl drop-shadow-2xl">
                            {pillar.title}
                        </h2>

                        <div className="w-20 h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                        <motion.p 
                            style={{ 
                                opacity: subtitleOpacity, 
                                y: subtitleY,
                                willChange: 'transform, opacity'
                            }}
                            className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 font-medium leading-relaxed max-w-2xl drop-shadow-lg"
                        >
                            {pillar.overview}
                        </motion.p>

                        {pillar.content && (
                            <motion.div 
                                style={{ 
                                    opacity: detailOpacity, 
                                    y: detailY,
                                    willChange: 'transform, opacity'
                                }}
                                className="text-white/70 text-xs sm:text-sm font-light leading-relaxed prose prose-invert max-w-2xl text-center max-h-[22vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent mt-4 border-t border-white/10 pt-4"
                                dangerouslySetInnerHTML={{ __html: pillar.content }}
                            />
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}


export default function OurApproachContent() {
    const { data: pillars, isLoading } = useApi<Pillar[]>('/pillars')
    const { videoSrc, bgImage, mediaLoading } = usePageHeroMedia({ settingsKey: 'hero_products_media' })
    const heroMedia = videoSrc ?? bgImage

    if (isLoading) {
        return (
            <BaseLayout loading>
                <SectionSkeleton />
            </BaseLayout>
        )
    }

    const navSections = React.useMemo(() => (
        pillars && pillars.length > 0
            ? [{ id: 'hero', label: 'Intro' }, ...pillars.map(p => ({ id: `pillar-${p.slug}`, label: p.title }))]
            : undefined
    ), [pillars])

    return (
        <BaseLayout
            heroMedia={heroMedia}
            tagline="Our Approach"
            title="Engineering <br />Excellence."
            subtitle="High-performance software and digital engineering with measurable outcomes."
            loading={mediaLoading}
            navSections={navSections}
        >
            {pillars && pillars.length > 0 ? (
                pillars.map((pillar, index) => (
                    <PillarSection key={pillar.id} pillar={pillar} index={index} />
                ))
            ) : (
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-muted-foreground">No approach sections found.</p>
                </div>
            )}
        </BaseLayout>
    )
}
