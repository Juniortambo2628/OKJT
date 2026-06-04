"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

const BackToTop = () => {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const handler = () => setShow(window.scrollY > 400)
        window.addEventListener('scroll', handler, { passive: true })
        return () => window.removeEventListener('scroll', handler)
    }, [])

    return (
        <AnimatePresence>
            {show && (
                <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-6 left-6 z-[70] w-11 h-11 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary hover:border-primary/30 transition-all shadow-lg backdrop-blur-sm"
                    aria-label="Back to top"
                >
                    <ArrowUp size={18} />
                </motion.button>
            )}
        </AnimatePresence>
    )
}

export default BackToTop
