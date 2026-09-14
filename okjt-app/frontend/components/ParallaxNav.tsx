"use client"

import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll } from 'framer-motion'
import { useCookieConsent } from '@/components/CookieConsentProvider'

interface SectionInfo {
    id: string
    label: string
}

interface ParallaxNavProps {
    sections: SectionInfo[]
}

export default function ParallaxNav({ sections }: ParallaxNavProps) {
    const { showBanner } = useCookieConsent()
    const { scrollYProgress } = useScroll()
    const [activeIndex, setActiveIndex] = useState(0)
    const [isScrolling, setIsScrolling] = useState(false)
    const navRef = useRef<HTMLDivElement>(null)
    const activeIndexRef = useRef(0)
    const sectionsRef = useRef<(HTMLElement | null)[]>([])
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        sectionsRef.current = sections.map(s => document.getElementById(s.id))
    }, [sections])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(true)
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
            scrollTimeout.current = setTimeout(() => setIsScrolling(false), 2000)

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
                        activeSecProgress = index === sections.length - 1 ? 1 : activeSecProgress
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
        // Initial state
        scrollTimeout.current = setTimeout(() => setIsScrolling(false), 3000)
        handleScroll()
        
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
        }
    }, [sections])

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    // Keep clear of the cookie-consent banner, which also pins to the bottom.
    if (sections.length <= 1 || showBanner) return null

    const activeLabel = sections[activeIndex]?.label

    return (
        <>
            {/* Top-of-viewport progress bar — consistent across every page */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/80 z-[100] origin-left shadow-[0_0_8px_rgba(224,180,68,0.5)] pointer-events-none"
                style={{ scaleX: scrollYProgress }}
            />

            {/* Container width stays constant regardless of active label — every
                dot has the same footprint, so the whole indicator is truly centered
                in the viewport. The active pill is rendered as a floating badge
                above the active dot rather than inline. */}
            <motion.div
                ref={navRef}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: isScrolling ? 1 : 0.4 }}
                whileHover={{ opacity: 1 }}
                transition={{ opacity: { duration: 0.5 } }}
                // Center + sit close to the bottom of the viewport on every
                // device. `max-w-[calc(100vw-1.5rem)]` guarantees the pill never
                // pushes past the screen edge on small screens.
                className="fixed bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-[calc(100vw-1.5rem)] bg-background/50 backdrop-blur-xl border border-foreground/15 rounded-full px-2.5 py-1.5 md:px-3 md:py-2 flex items-center justify-center gap-2 md:gap-3 shadow-2xl transition-colors"
            >
                {sections.map((section, index) => {
                    const isActive = activeIndex === index
                    return (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className="group relative flex items-center justify-center w-2 h-2"
                            aria-label={section.label}
                            aria-current={isActive || undefined}
                        >
                            <span
                                className={`block rounded-full transition-all duration-300 ${
                                    isActive
                                        ? 'w-2 h-2 bg-foreground shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                                        : 'w-1.5 h-1.5 bg-foreground/25 group-hover:bg-foreground/60'
                                }`}
                            />
                            {isActive && (
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest shadow-md whitespace-nowrap pointer-events-none max-w-[80vw] overflow-hidden">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                    <span className="truncate">{activeLabel}</span>
                                </span>
                            )}
                            {!isActive && (
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-foreground text-background text-[10px] font-bold rounded-full uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                                    {section.label}
                                </span>
                            )}
                        </button>
                    )
                })}
            </motion.div>
        </>
    )
}
