"use client"

import React from 'react'

const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#050a1a]">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050a1a] via-[#0a1533] to-[#050a1a]" />

      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  )
}

export default BackgroundEffects
