"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/use-api'
import { Project } from '@/types/api'
import { getMediaUrl } from '@/lib/utils'


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
            <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none" />

                <div className="flex gap-4 marquee-track">
                    {items.map((project, index) => (
                        <Link
                            key={`${project.id}-${index}`}
                            href={`/projects/${project.slug}`}
                            className="flex-shrink-0 w-[92px] sm:w-[104px] md:w-[116px] group"
                            aria-label={project.title}
                        >
                            <div className="relative aspect-[1/1.1] rounded-lg overflow-hidden border border-white/5 group-hover:border-primary/30 transition-all duration-300">
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

                                {/* Glass pill tooltip — shown on hover instead of a static label */}
                                <div className="absolute inset-x-1.5 bottom-1.5 flex justify-center pointer-events-none">
                                    <span className="max-w-full truncate rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                        {project.title}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FlagshipHeroCarousel
