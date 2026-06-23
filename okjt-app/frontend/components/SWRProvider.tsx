'use client'

import { SWRConfig } from 'swr'
import React from 'react'

interface SWRProviderProps {
  fallback: Record<string, any>
  children: React.ReactNode
}

export default function SWRProvider({ fallback, children }: SWRProviderProps) {
  return (
    <SWRConfig value={{ fallback }}>
      {children}
    </SWRConfig>
  )
}