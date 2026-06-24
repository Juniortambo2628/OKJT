"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { CookieConsentProvider } from '@/components/CookieConsentProvider'
import CookieConsent from '@/components/CookieConsent'
import Chatbot from '@/components/Chatbot'
import BackToTop from '@/components/BackToTop'
import WhatsAppButton from '@/components/WhatsAppButton'
import { usePageView } from '@/hooks/usePageView'
import CustomCursor from '@/components/animations/CustomCursor'
import PageTransition from '@/components/animations/PageTransition'
import LoadingScreen from '@/components/LoadingScreen'
import { useSettings } from '@/hooks/use-settings'

function AnalyticsTracker() {
    usePageView()
    return null
}

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith('/admin')
    const { isLoading } = useSettings()

    return (
        <CookieConsentProvider>
            {!isAdmin && <LoadingScreen isLoading={isLoading} />}
            <AnalyticsTracker />
            <CustomCursor />
            <PageTransition>
                {children}
            </PageTransition>
            {/* Only show visitor widgets on public pages */}
            {!isAdmin && (
                <>
                    <CookieConsent />
                    <Chatbot />
                    <WhatsAppButton />
                    <BackToTop />
                </>
            )}
        </CookieConsentProvider>
    )
}

export default ClientLayout
