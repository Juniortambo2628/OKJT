"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

const PageTransition = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ 
                    duration: 0.4, 
                    ease: "easeInOut" 
                }}
                className="w-full h-full flex flex-col flex-1 relative"
                id="content"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

export default PageTransition
