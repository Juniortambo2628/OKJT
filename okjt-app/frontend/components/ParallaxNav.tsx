"use client"

import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SectionInfo {
    id: string
    label: string
}

interface ParallaxNavProps {
    sections: SectionInfo[]
}

export default function ParallaxNav({ sections }: ParallaxNavProps) {
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

    if (sections.length <= 1) return null

    return (
        <motion.div 
            ref={navRef}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: isScrolling ? 1 : 0.3 }}
            whileHover={{ opacity: 1 }}
            transition={{ opacity: { duration: 0.5 } }}
            className="fixed bottom-10 right-6 md:right-10 z-[60] bg-background/20 backdrop-blur-md border border-foreground/15 rounded-full px-4 py-2.5 flex items-center gap-3 shadow-lg overflow-hidden transition-colors"
        >
            {sections.map((section, index) => (
                <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="group relative flex items-center justify-center p-1"
                >
                    {activeIndex === index ? (
                        <div className="w-6 h-2 rounded-full bg-foreground/30 overflow-hidden relative transition-all duration-500">
                            <div 
                                className="absolute top-0 left-0 bottom-0 bg-foreground transition-all duration-75 ease-out shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                                style={{ width: 'calc(var(--active-progress, 0) * 100%)' }}
                            />
                        </div>
                    ) : (
                        <div className="w-2 h-2 rounded-full bg-foreground/20 hover:bg-foreground/50 transition-all duration-300" />
                    )}
                    <span className="absolute bottom-full right-0 mb-4 px-3 py-1.5 bg-foreground text-background text-[10px] font-bold rounded uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                        {section.label}
                    </span>
                </button>
            ))}
        </motion.div>
    )
}
