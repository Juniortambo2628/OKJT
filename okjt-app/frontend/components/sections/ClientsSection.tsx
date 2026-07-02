"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { useApi } from '@/hooks/use-api'
import FadeIn from '@/components/animations/FadeIn'

const ClientsSection = () => {
    const { data: clients, isLoading, isError } = useApi('/clients')

    if (isLoading || isError || !clients || clients.length === 0) return null

    // Duplicate for infinite scroll illusion
    const duplicated = [...clients, ...clients]

    return (
        <section className="w-full py-20 bg-background border-t border-b border-border/50 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 mb-12">
                <FadeIn className="text-center" direction="up" distance={16} blur={false}>
                    <span className="text-muted-foreground text-sm font-bold uppercase tracking-[0.2em]">
                        Trusted by ambitious brands
                    </span>
                </FadeIn>
            </div>

            {/* Infinite Scroll Marquee */}
            <div className="relative">
                {/* Left/Right Fade Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

                <motion.div
                    className="flex items-center gap-16 whitespace-nowrap"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: 'loop',
                            duration: 30,
                            ease: 'linear',
                        },
                    }}
                >
                    {duplicated.map((client: any, index: number) => (
                        <div
                            key={`${client.id}-${index}`}
                            className="flex items-center justify-center min-w-[200px] h-16 px-8 group"
                        >
                            {client.logo ? (
                                <img
                                    src={client.logo}
                                    alt={client.name}
                                    className="h-10 object-contain opacity-40 group-hover:opacity-70 transition-opacity grayscale group-hover:grayscale-0"
                                />
                            ) : (
                                <span className="text-muted-foreground/40 font-bold text-lg tracking-wider uppercase group-hover:text-foreground/60 transition-colors">
                                    {client.name}
                                </span>
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default ClientsSection
