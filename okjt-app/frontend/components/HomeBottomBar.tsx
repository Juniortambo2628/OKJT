"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const HomeBottomBar = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="fixed bottom-0 left-0 w-full z-[100] pt-4 pb-4 md:pb-6 px-6 md:px-10 lg:px-16 pointer-events-none"
        >
            <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
                <span className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap shrink-0 hidden sm:block">
                    Discover More
                </span>
                <div className="flex items-center justify-center gap-6 sm:gap-8 lg:gap-12 flex-wrap">
                    {[
                        { id: 'value-proposition', label: 'Core Values' },
                        { id: 'stats', label: 'Impact Metrics' },
                        { id: 'services', label: 'Our Services' },
                        { id: 'insights', label: 'Advisory Notes' },
                        { id: 'cta', label: 'Get Started' }
                    ].map((section) => (
                        <button 
                            key={section.id} 
                            onClick={(e) => {
                                e.preventDefault();
                                const el = document.getElementById(section.id);
                                if (el) {
                                    // Offset by 15vh to ensure parallax title is perfectly visible
                                    const offset = window.innerHeight * 0.15;
                                    const y = el.getBoundingClientRect().top + window.scrollY + offset;
                                    window.scrollTo({ top: y, behavior: 'smooth' });
                                }
                            }}
                            className="text-white/70 font-semibold text-xs sm:text-sm tracking-wider hover:text-white transition-all flex items-center gap-2 group drop-shadow-md"
                        >
                            {section.label}
                            <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary drop-shadow-md" />
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

export default HomeBottomBar
