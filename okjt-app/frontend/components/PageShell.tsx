"use client"

import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ParallaxNav from '@/components/ParallaxNav'
import { cn } from '@/lib/utils'

interface PageShellProps {
    children: React.ReactNode
    className?: string
    navSections?: { id: string; label: string }[]
}

export function PageShell({ children, className, navSections }: PageShellProps) {
    return (
        <main className={cn("flex min-h-screen flex-col bg-background w-full overflow-x-clip", className)}>
            <Navbar />
            {children}
            {navSections && <ParallaxNav sections={navSections} />}
            <Footer />
        </main>
    )
}
