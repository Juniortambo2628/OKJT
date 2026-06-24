"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useSettings } from '@/hooks/use-settings'

interface LoadingScreenProps {
  isLoading: boolean
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
  const [show, setShow] = useState(true)
  const { branding } = useSettings()

  const logo = branding?.logo_dark || '/logos/OKJT-Logos/OKJTechLogo-White_Transparent.png'

  // Keep it showing briefly to ensure visual continuity during layout rendering
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShow(false), 800)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(235,200,130,0.08)_0%,transparent_70%)]" />
          
          {/* Staggered Dot Grid background */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }} 
          />

          <div className="relative flex flex-col items-center gap-10">
            {/* Animated Brand Emblem/Icon Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                transition: { duration: 0.5, ease: "easeOut" }
              }}
              className="relative flex items-center justify-center"
            >
              {/* Actual Logo from backend */}
              <Image
                src={logo}
                alt="OKJTech Logo"
                width={280}
                height={70}
                className="h-16 md:h-20 w-auto object-contain z-10 select-none brightness-100 filter"
                priority
              />
            </motion.div>

            {/* Custom linear loading bar indicator */}
            <div className="w-48 h-[2px] bg-secondary/30 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute w-1/2 h-full bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
