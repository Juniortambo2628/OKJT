"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface SectionCardProps {
    toolbarTitle?: string
    tabs?: string[]
    activeTab?: string
    onTabChange?: (tab: string) => void
    children: React.ReactNode
    className?: string
}

export function SectionCard({
    toolbarTitle = "Discover More",
    tabs = [],
    activeTab,
    onTabChange,
    children,
    className = ""
}: SectionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`w-full h-[75vh] flex flex-col bg-foreground/5 backdrop-blur-3xl border border-foreground/10 rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-2xl overflow-hidden ${className}`}
        >
            <div className="relative flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="min-h-full flex flex-col justify-center w-full py-4">
                    {children}
                </div>
            </div>

            {tabs.length > 0 && (
                <div className="border-t border-foreground/10 mt-6 pt-6 shrink-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-10">
                        <span className="text-foreground/30 text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] whitespace-nowrap shrink-0">
                            {toolbarTitle}
                        </span>
                        <div className="flex items-center gap-4 sm:gap-6 lg:gap-10 flex-wrap">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => onTabChange?.(tab)}
                                    className={`relative text-xs sm:text-sm font-semibold tracking-wider transition-all flex items-center gap-2 group ${
                                        activeTab === tab 
                                            ? 'text-primary drop-shadow-[0_0_8px_rgba(235,200,130,0.5)]' 
                                            : 'text-foreground/50 hover:text-foreground'
                                    }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div 
                                            layoutId="activeTabIndicator"
                                            className="absolute -top-[25px] left-0 right-0 h-[2px] bg-primary" 
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    )
}
