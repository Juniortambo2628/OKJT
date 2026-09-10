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

    // Only treat the value as "countable" when it's a single run of digits with
    // optional non-digit prefix/suffix (e.g. "20+", "Since 2021", "99.99%").
    // Anything else (e.g. "Laravel · Next.js · React") is rendered verbatim.
    const countMatch = target.match(/^(\D*)(\d[\d,]*)(\D*)$/)
    const numericValue = countMatch ? parseInt(countMatch[2].replace(/,/g, ''), 10) : NaN
    const prefix = countMatch?.[1] ?? ''
    const originalSuffix = countMatch?.[3] || suffix
    // Don't group years/small counts with a thousands separator ("2,021").
    const format = (n: number) => (numericValue >= 10000 ? n.toLocaleString() : String(n))

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

    if (isNaN(numericValue)) {
        return <span ref={ref} className={className}>{target}</span>
    }

    return (
        <span ref={ref} className={className}>
            {prefix}{isInView ? format(count) : '0'}{originalSuffix}
        </span>
    )
}
