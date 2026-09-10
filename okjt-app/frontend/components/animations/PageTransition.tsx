"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

const PageTransition = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname()

    // `mode="wait"` unmounts the previous page before mounting the next one;
    // paired with an `exit` prop on the child, this prevents the old page from
    // remaining rendered below the new one after a route change.
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
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

export default PageTransition
