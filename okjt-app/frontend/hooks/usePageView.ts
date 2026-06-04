"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import api from '@/lib/api'

export function usePageView() {
    const pathname = usePathname()

    useEffect(() => {
        // Check for analytics consent
        try {
            const stored = localStorage.getItem('okjt_cookie_consent')
            if (stored) {
                const consent = JSON.parse(stored)
                if (!consent.analytics) return
            } else {
                return // No consent given yet
            }
        } catch {
            return
        }

        // Track the page view
        api.post('/track', { path: pathname }).catch(() => {})
    }, [pathname])
}
