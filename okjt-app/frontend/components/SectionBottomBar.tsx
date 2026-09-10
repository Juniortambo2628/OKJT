"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { NavSection } from '@/lib/nav-sections'
import { useCookieConsent } from '@/components/CookieConsentProvider'

interface SectionBottomBarProps {
    sections: NavSection[]
}

/**
 * Persistent labelled jump bar pinned to the bottom of every page that passes
 * a `navSections` list to BaseLayout. The first entry (the hero/intro) is
 * dropped — you don't jump "up to the top" from a bar that's already at the
 * bottom of the viewport.
 *
 * The link for the section currently in view is highlighted. Hidden while the
 * cookie-consent banner is showing so the two never stack at bottom-0.
 */
const SectionBottomBar = ({ sections }: SectionBottomBarProps) => {
    const { showBanner } = useCookieConsent()
    const items = sections.slice(1)
    const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null)
    const idsKey = items.map((s) => s.id).join(',')

    useEffect(() => {
        const ids = idsKey ? idsKey.split(',') : []
        if (ids.length === 0) return

        const update = () => {
            // Active = the last section whose top has passed the 45% viewport line.
            const line = window.innerHeight * 0.45
            let current = ids[0]
            for (const id of ids) {
                const el = document.getElementById(id)
                if (el && el.getBoundingClientRect().top <= line) current = id
            }
            setActiveId(current)
        }

        update()
        window.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)
        return () => {
            window.removeEventListener('scroll', update)
            window.removeEventListener('resize', update)
        }
    }, [idsKey])

    if (items.length < 2 || showBanner) return null

    const jumpTo = (id: string) => {
        const el = document.getElementById(id)
        if (!el) return
        // Offset so the parallax section title clears the top of the viewport.
        const offset = window.innerHeight * 0.15
        const y = el.getBoundingClientRect().top + window.scrollY + offset
        window.scrollTo({ top: y, behavior: 'smooth' })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="fixed bottom-0 left-0 w-full z-[100] pt-4 pb-4 md:pb-6 px-6 md:px-10 lg:px-16 pointer-events-none"
        >
            <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
                <span className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap shrink-0 hidden sm:block">
                    Jump to
                </span>
                <div className="flex items-center justify-center gap-6 sm:gap-8 lg:gap-12 flex-wrap">
                    {items.map((section) => {
                        const active = section.id === activeId
                        return (
                            <button
                                key={section.id}
                                onClick={(e) => {
                                    e.preventDefault()
                                    jumpTo(section.id)
                                }}
                                aria-current={active ? 'true' : undefined}
                                className={`relative font-semibold text-xs sm:text-sm tracking-wider transition-all flex items-center gap-2 group drop-shadow-md ${
                                    active ? 'text-primary' : 'text-white/60 hover:text-white'
                                }`}
                            >
                                {section.label}
                                <ArrowRight
                                    className={`w-3 h-3 transition-all text-primary drop-shadow-md ${
                                        active ? 'opacity-100 ml-0' : 'opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0'
                                    }`}
                                />
                                <span
                                    className={`absolute -bottom-1.5 left-0 h-[2px] rounded-full bg-primary transition-all duration-300 ${
                                        active ? 'w-full opacity-100' : 'w-0 opacity-0'
                                    }`}
                                />
                            </button>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    )
}

export default SectionBottomBar
