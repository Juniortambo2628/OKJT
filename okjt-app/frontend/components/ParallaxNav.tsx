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
    const navRef = useRef<HTMLDivElement>(null)
    const activeIndexRef = useRef(0)
    const sectionsRef = useRef<(HTMLElement | null)[]>([])

    useEffect(() => {
        sectionsRef.current = sections.map(s => document.getElementById(s.id))
    }, [sections])

    useEffect(() => {
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
        handleScroll()
        
        return () => window.removeEventListener('scroll', handleScroll)
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
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            className="fixed bottom-10 left-1/2 z-[60] bg-black/45 backdrop-blur-xl border border-white/10 rounded-full px-5 py-3.5 flex items-center gap-4 shadow-2xl overflow-hidden"
        >
            {sections.map((section, index) => (
                <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
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
                        {section.label}
                    </span>
                </button>
            ))}
        </motion.div>
    )
}
