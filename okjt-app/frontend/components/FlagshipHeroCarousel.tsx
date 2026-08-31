"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useApi } from '@/hooks/use-api'
import { Project } from '@/types/api'
import { getMediaUrl } from '@/lib/utils'

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

const FlagshipHeroCarousel = () => {
    const { data: projects } = useApi<Project[]>('/projects')

    const flagship = useMemo(() => {
        if (!projects) return []
        return projects.filter(p => p.type === 'flagship' && p.is_active)
    }, [projects])

    if (flagship.length === 0) return null

    const items = [...flagship, ...flagship, ...flagship]

    return (
        <div className="relative w-full py-6 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 mb-5">
                <p className="text-foreground/30 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-center">
                    Featured Flagship Projects
                </p>
            </div>

            <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none" />

                <div className="flex gap-4 marquee-track">
                    {items.map((project, index) => (
                        <Link
                            key={`${project.id}-${index}`}
                            href={`/projects/${project.slug}`}
                            className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] group"
                        >
                            <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-white/5 group-hover:border-primary/30 transition-all duration-300">
                                {project.image ? (
                                    <img
                                        src={getMediaUrl(project.image)}
                                        alt={project.title}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-primary/5" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            </div>
                            <p className="text-foreground/50 text-[10px] sm:text-xs mt-2 text-center line-clamp-1 group-hover:text-foreground/80 transition-colors">
                                {project.title}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FlagshipHeroCarousel
