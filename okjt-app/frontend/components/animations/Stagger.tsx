"use client"

import React from 'react'
import { motion, useReducedMotion, type Transition } from 'framer-motion'
import { cn } from '@/lib/utils'
import { EASE_OUT_EXPO, fadeInVariants, type FadeDirection } from './FadeIn'

interface StaggerContainerProps {
    children: React.ReactNode
    className?: string
    staggerDelay?: number
    delayChildren?: number
    once?: boolean
    amount?: number
}

export function StaggerContainer({
    children,
    className,
    staggerDelay = 0.1,
    delayChildren = 0.15,
    once = true,
    amount = 0.2,
}: StaggerContainerProps) {
    const prefersReducedMotion = useReducedMotion()

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>
    }

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once, amount }}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren,
                    },
                },
            }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    )
}

interface StaggerItemProps {
    children: React.ReactNode
    direction?: FadeDirection
    distance?: number
    blur?: boolean
    className?: string
    transition?: Transition
}

export function StaggerItem({
    children,
    direction = 'up',
    distance = 30,
    blur = false,
    className,
    transition,
}: StaggerItemProps) {
    const variants = fadeInVariants(direction, distance, blur)

    return (
        <motion.div
            variants={{
                hidden: variants.hidden,
                visible: {
                    ...variants.visible,
                    transition: {
                        duration: 0.7,
                        ease: EASE_OUT_EXPO,
                        ...transition,
                    },
                },
            }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    )
}
