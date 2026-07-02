"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

interface CountUpProps {
    target: string
    suffix?: string
    duration?: number
    className?: string
}

export default function CountUp({ target, suffix = '', duration = 1.5, className }: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const isInView = useInView(ref, { once: true, amount: 0.5 })
    const [count, setCount] = useState(0)
    const prefersReducedMotion = useReducedMotion()

    const numericValue = parseInt(target.replace(/[^0-9]/g, ''), 10)
    const prefix = target.match(/^[^0-9]*/)?.[0] || ''
    const originalSuffix = target.match(/[^0-9]*$/)?.[0] || suffix

    useEffect(() => {
        if (!isInView || isNaN(numericValue)) return

        if (prefersReducedMotion) {
            setCount(numericValue)
            return
        }

        let startTime: number | null = null
        let animationFrame: number

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * numericValue))

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate)
            }
        }

        animationFrame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationFrame)
    }, [isInView, numericValue, duration, prefersReducedMotion])

    return (
        <span ref={ref} className={className}>
            {prefix}{isInView ? count.toLocaleString() : '0'}{originalSuffix}
        </span>
    )
}
