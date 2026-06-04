"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = useState(false)
    const [isClicked, setIsClicked] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Detect if touch device - we don't want custom cursor on mobile
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
        if (isTouchDevice) return

        setIsVisible(true)

        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            // Trigger hover state on links, buttons, and custom triggers
            if (
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('cursor-magnetic')
            ) {
                setIsHovering(true)
            } else {
                setIsHovering(false)
            }
        }

        const handleMouseDown = () => setIsClicked(true)
        const handleMouseUp = () => setIsClicked(false)

        window.addEventListener('mousemove', updateMousePosition)
        window.addEventListener('mouseover', handleMouseOver)
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', updateMousePosition)
            window.removeEventListener('mouseover', handleMouseOver)
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    if (!isVisible) return null

    const variants = {
        default: {
            x: mousePosition.x - 16,
            y: mousePosition.y - 16,
            height: 32,
            width: 32,
            backgroundColor: "rgba(235, 200, 130, 0)",
            border: "2px solid rgba(235, 200, 130, 0.8)",
            opacity: 1,
            scale: 1,
            transition: { type: "tween" as const, ease: "backOut" as const, duration: 0.15 }
        },
        hover: {
            x: mousePosition.x - 24,
            y: mousePosition.y - 24,
            height: 48,
            width: 48,
            backgroundColor: "rgba(235, 200, 130, 0.1)",
            border: "2px solid rgba(235, 200, 130, 1)",
            opacity: 1,
            scale: 1.2,
            transition: { type: "spring" as const, stiffness: 300, damping: 20 }
        },
        clicked: {
            scale: 0.8,
            backgroundColor: "rgba(235, 200, 130, 0.4)",
            border: "2px solid rgba(235, 200, 130, 1)",
            transition: { type: "spring" as const, stiffness: 500, damping: 10 }
        }
    }

    return (
        <motion.div
            className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
            variants={variants}
            initial="default"
            animate={isClicked ? "clicked" : isHovering ? "hover" : "default"}
        />
    )
}

export default CustomCursor
