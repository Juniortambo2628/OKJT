"use client"

import React from 'react'
import { motion, useReducedMotion, type Transition } from 'framer-motion'
import { cn } from '@/lib/utils'

export type FadeDirection = 'up' | 'down' | 'left' | 'right' | 'none'

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT_SMOOTH = [0.65, 0, 0.35, 1] as const
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const

interface FadeInProps {
    children: React.ReactNode
    direction?: FadeDirection
    delay?: number
    duration?: number
    distance?: number
    blur?: boolean
    className?: string
    once?: boolean
    amount?: number
    transition?: Transition
}

const offsets: Record<FadeDirection, { x: number; y: number }> = {
    up: { x: 0, y: 1 },
    down: { x: 0, y: -1 },
    left: { x: 1, y: 0 },
    right: { x: -1, y: 0 },
    none: { x: 0, y: 0 },
}

export const fadeInVariants = (direction: FadeDirection = 'up', distance = 40, blur = true) => {
    const { x, y } = offsets[direction]
    return {
        hidden: {
            opacity: 0,
            x: x * distance,
            y: y * distance,
            filter: blur ? 'blur(10px)' : 'blur(0px)',
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            filter: 'blur(0px)',
        },
    }
}

export default function FadeIn({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.8,
    distance = 40,
    blur = true,
    className,
    once = true,
    amount = 0.25,
    transition,
}: FadeInProps) {
    const prefersReducedMotion = useReducedMotion()

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>
    }

    const variants = fadeInVariants(direction, distance, blur)

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once, amount }}
            variants={variants}
            transition={{
                duration,
                delay,
                ease: EASE_OUT_EXPO,
                ...transition,
            }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    )
}
