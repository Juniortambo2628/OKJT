"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import PrimaryButton from '@/components/PrimaryButton'

interface SectionCardProps {
    badgeText?: string
    title?: string | React.ReactNode
    subtitle?: string | React.ReactNode
    cta?: { label: string; href: string } | null
    toolbarTitle?: string
    tabs?: string[]
    activeTab?: string
    onTabChange?: (tab: string) => void
    children?: React.ReactNode
    className?: string
}

export function SectionCard({
    badgeText,
    title,
    subtitle,
    cta,
    toolbarTitle = "Discover More",
    tabs = [],
    activeTab,
    onTabChange,
    children,
    className = ""
}: SectionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "w-full h-[75vh] flex flex-col bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl overflow-hidden",
                className
            )}
        >
            <div className="flex flex-col h-full">
                {/* Header block */}
                <div className="flex-shrink-0 mb-6 md:mb-8">
                    {badgeText && (
                        <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">
                            {badgeText}
                        </span>
                    )}
                    {title && (
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] max-w-4xl mb-4">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl mb-6">
                            {subtitle}
                        </p>
                    )}
                    {cta && (
                        <PrimaryButton href={cta.href} variant="outline" size="sm" showArrow>
                            {cta.label}
                        </PrimaryButton>
                    )}
                </div>

                {/* Filter tabs */}
                {tabs.length > 0 && (
                    <div className="flex-shrink-0 border-b border-white/10 pb-4 mb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                            <span className="text-white/30 text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] whitespace-nowrap">
                                {toolbarTitle}
                            </span>
                            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => onTabChange?.(tab)}
                                        className={`relative text-xs sm:text-sm font-semibold tracking-wider transition-all flex items-center gap-2 group ${
                                            activeTab === tab
                                                ? 'text-primary drop-shadow-[0_0_8px_rgba(235,200,130,0.5)]'
                                                : 'text-white/50 hover:text-white'
                                        }`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="activeTabIndicator"
                                                className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-primary"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Carousel / content area */}
                {children && (
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {children}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
