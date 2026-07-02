"use client"

import React, { useRef } from 'react'
import { useApi } from '@/hooks/use-api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Pillar } from '@/types/api'
import Hero from '@/components/Hero'
import { usePageHeroMedia } from '@/hooks/use-page-hero-media'
import { SkeletonBlock, SectionSkeleton } from '@/components/MediaSkeleton'

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
                            FOUNDATION 0{index + 1}
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


const PillarNav = ({ pillars }: { pillars: Pillar[] }) => {
    const [activeIndex, setActiveIndex] = React.useState(0)
    const navRef = useRef<HTMLDivElement>(null)
    const activeIndexRef = useRef(0)
    const sectionsRef = useRef<(HTMLElement | null)[]>([])

    React.useEffect(() => {
        sectionsRef.current = pillars.map(p => document.getElementById(`pillar-${p.slug}`))
    }, [pillars])

    React.useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY
            const viewportHeight = window.innerHeight

            let activeIdx = 0
            let activeSecProgress = 0

            sectionsRef.current.forEach((section, index) => {
                if (section) {
                    const startY = section.offsetTop
                    const stickyDistance = Math.max(1, section.offsetHeight - viewportHeight)
                    const sectionProgress = Math.max(0, Math.min(1, (scrollY - startY) / stickyDistance))
                    
                    if (scrollY >= startY && scrollY <= startY + stickyDistance) {
                        activeIdx = index
                        activeSecProgress = sectionProgress
                    } else if (scrollY > startY + stickyDistance) {
                        activeIdx = index
                        activeSecProgress = index === pillars.length - 1 ? 1 : activeSecProgress
                    }
                }
            })

            if (activeIdx !== activeIndexRef.current) {
                activeIndexRef.current = activeIdx
                setActiveIndex(activeIdx)
            }

            if (navRef.current) {
                navRef.current.style.setProperty('--active-progress', `${activeSecProgress}`)
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
        
        return () => window.removeEventListener('scroll', handleScroll)
    }, [pillars])

    const scrollToPillar = (slug: string) => {
        const element = document.getElementById(`pillar-${slug}`)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <motion.div 
            ref={navRef}
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            className="fixed bottom-10 left-1/2 z-[60] bg-black/45 backdrop-blur-xl border border-white/10 rounded-full px-5 py-3.5 flex items-center gap-4 shadow-2xl overflow-hidden"
        >
            {pillars.map((pillar, index) => (
                <button
                    key={pillar.id}
                    onClick={() => scrollToPillar(pillar.slug)}
                    className="group relative flex items-center justify-center p-1"
                >
                    {activeIndex === index ? (
                        <div className="w-8 h-2.5 rounded-full bg-white/20 overflow-hidden relative transition-all duration-500">
                            <div 
                                className="absolute top-0 left-0 bottom-0 bg-primary transition-all duration-75 ease-out shadow-[0_0_8px_rgba(224,180,68,0.5)]" 
                                style={{ width: 'calc(var(--active-progress, 0) * 100%)' }}
                            />
                        </div>
                    ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-white/50 transition-all duration-300" />
                    )}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-1.5 bg-primary text-[#14110b] text-[9px] font-bold rounded uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                        {pillar.title}
                    </span>
                </button>
            ))}
        </motion.div>
    )
}

export default function OurApproachContent() {
    const { data: pillars, isLoading } = useApi<Pillar[]>('/pillars')
    const { scrollYProgress } = useScroll()
    const { videoSrc, bgImage, mediaLoading } = usePageHeroMedia({ settingsKey: 'hero_products_media' })

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background">
                <SectionSkeleton />
            </main>
        )
    }

    return (
        <main className="flex min-h-screen flex-col bg-background w-full overflow-x-clip relative">
            <Navbar />

            <motion.div 
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/80 z-[100] origin-left shadow-[0_0_8px_rgba(224,180,68,0.5)]"
                style={{ scaleX: scrollYProgress }}
            />

            <Hero
                tagline="Our Approach"
                title="Engineering <br />Excellence."
                subtitle="High-performance software and digital engineering with measurable outcomes. Explore our engineering foundations."
                videos={videoSrc ? [videoSrc] : undefined}
                bgImage={bgImage}
                loading={mediaLoading}
            />

            {pillars && pillars.length > 0 ? (
                <>
                    <div className="bg-black w-full overflow-visible">
                        {pillars.map((pillar, index) => (
                            <PillarSection key={pillar.id} pillar={pillar} index={index} />
                        ))}
                    </div>
                    <PillarNav pillars={pillars} />
                </>
            ) : (
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-muted-foreground">No foundations found.</p>
                </div>
            )}

            <section className="relative z-20">
                <Footer />
            </section>
        </main>
    )
}
