"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

/**
 * Route-change transition.
 *
 * `AnimatePresence mode="wait"` keyed on the pathname is a known trap under the
 * App Router + React 19: the exiting page can unmount before the entering one is
 * committed, leaving a blank screen until a hard reload. Instead we key a plain
 * `motion.div` on the pathname — React swaps the whole subtree on a route change
 * (so the previous page never lingers) and the new one just fades in. No
 * presence tracking, nothing to get stuck.
 */
const PageTransition = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname()

    return (
        <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full h-full flex flex-col flex-1 relative"
        >
            {children}
        </motion.div>
    )
}

export default PageTransition
