"use client"

import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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

    return (
        <motion.div
            ref={navRef}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: isScrolling ? 1 : 0.4 }}
            whileHover={{ opacity: 1 }}
            transition={{ opacity: { duration: 0.5 } }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-background/40 backdrop-blur-xl border border-foreground/15 rounded-full px-2.5 py-1.5 flex items-center gap-1.5 shadow-2xl overflow-hidden transition-colors"
        >
            {sections.map((section, index) => (
                <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="group relative flex items-center justify-center p-0.5"
                >
                    {activeIndex === index ? (
                        <div className="w-5 h-1.5 rounded-full bg-foreground/30 overflow-hidden relative transition-all duration-500">
                            <div
                                className="absolute top-0 left-0 bottom-0 bg-foreground transition-all duration-75 ease-out shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                style={{ width: 'calc(var(--active-progress, 0) * 100%)' }}
                            />
                        </div>
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/20 hover:bg-foreground/50 transition-all duration-300" />
                    )}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-foreground text-background text-[10px] font-bold rounded uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                        {section.label}
                    </span>
                </button>
            ))}
        </motion.div>
    )
}
