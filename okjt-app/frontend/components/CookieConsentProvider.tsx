"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

type ConsentCategory = 'essential' | 'analytics' | 'marketing'

interface CookieConsentContextType {
    consent: Record<ConsentCategory, boolean>
    hasConsent: (category: ConsentCategory) => boolean
    updateConsent: (category: ConsentCategory, value: boolean) => void
    acceptAll: () => void
    rejectAll: () => void
    savePreferences: () => void
    showBanner: boolean
    showPreferences: boolean
    setShowPreferences: (val: boolean) => void
}

const CookieConsentContext = createContext<CookieConsentContextType | null>(null)

export const useCookieConsent = () => {
    const ctx = useContext(CookieConsentContext)
    if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider')
    return ctx
}

const STORAGE_KEY = 'okjt_cookie_consent'

export const CookieConsentProvider = ({ children }: { children: React.ReactNode }) => {
    const [consent, setConsent] = useState<Record<ConsentCategory, boolean>>({
        essential: true,
        analytics: false,
        marketing: false,
    })
    const [showBanner, setShowBanner] = useState(false)
    const [showPreferences, setShowPreferences] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                setConsent(JSON.parse(stored))
            } catch {
                setShowBanner(true)
            }
        } else {
            setShowBanner(true)
        }
    }, [])

    const saveToStorage = useCallback((c: Record<ConsentCategory, boolean>) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(c))
        setShowBanner(false)
        setShowPreferences(false)
    }, [])

    const hasConsent = useCallback((category: ConsentCategory) => consent[category], [consent])

    const updateConsent = useCallback((category: ConsentCategory, value: boolean) => {
        if (category === 'essential') return // always on
        setConsent(prev => ({ ...prev, [category]: value }))
    }, [])

    const acceptAll = useCallback(() => {
        const all = { essential: true, analytics: true, marketing: true }
        setConsent(all)
        saveToStorage(all)
    }, [saveToStorage])

    const rejectAll = useCallback(() => {
        const min = { essential: true, analytics: false, marketing: false }
        setConsent(min)
        saveToStorage(min)
    }, [saveToStorage])

    const savePreferences = useCallback(() => {
        saveToStorage(consent)
    }, [consent, saveToStorage])

    return (
        <CookieConsentContext.Provider value={{
            consent, hasConsent, updateConsent, acceptAll, rejectAll, savePreferences,
            showBanner, showPreferences, setShowPreferences,
        }}>
            {children}
        </CookieConsentContext.Provider>
    )
}
