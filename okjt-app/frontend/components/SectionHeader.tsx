"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface SectionHeaderProps {
    tagline?: string
    title?: string
    subtitle?: string
    align?: 'left' | 'center'
    className?: string
}

export function SectionHeader({ tagline, title, subtitle, align = 'left', className }: SectionHeaderProps) {
    if (!tagline && !title && !subtitle) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={className}
        >
            {tagline && (
                <span className="text-primary font-bold text-sm uppercase tracking-[0.2em] mb-4 block">
                    {tagline}
                </span>
            )}
            {title && (
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {title}
                </h2>
            )}
            {subtitle && (
                <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl">
                    {subtitle}
                </p>
            )}
        </motion.div>
    )
}
