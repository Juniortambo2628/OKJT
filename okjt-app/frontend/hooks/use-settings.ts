"use client"

import { useMemo } from 'react'
import { useApi } from './use-api'
import { SiteSetting } from '@/types/api'

export function useSettings() {
    const { data: settingsByGroup, isLoading, isError, mutate } = useApi<Record<string, SiteSetting[]>>('/settings')

    // Memoized flat list of settings for faster lookup
    const allSettings = useMemo(() => {
        if (!settingsByGroup) return []
        return Object.values(settingsByGroup).flat()
    }, [settingsByGroup])

    /**
     * Helper to find a specific setting value by key
     */
    const getSetting = (key: string, defaultValue: string = ''): string => {
        const setting = allSettings.find(s => s.key === key)
        return setting?.value || defaultValue
    }

    /**
     * Helper to check if a setting is enabled (returns true for 1, true, or on)
     */
    const isEnabled = (key: string, defaultEnabled: boolean = false): boolean => {
        const val = getSetting(key, defaultEnabled ? '1' : '0').toLowerCase()
        return val === '1' || val === 'true' || val === 'on'
    }

    // Pre-calculated brand assets for convenience
    const branding = useMemo(() => ({
        logo_light: getSetting('logo_light', '/logos/OKJT-Logos/OKJTechLogo-Black_Transparent.png'),
        logo_dark: getSetting('logo_dark', '/logos/OKJT-Logos/OKJTechLogo-White_Transparent.png'),
        logo_nobg: getSetting('logo_nobg', '/logos/OKJT-Logos/OKJTStyle_NoBG.png'),
        favicon: getSetting('favicon', '/logos/OKJT-Logos/OKJTechLogo-Black_BG-favicon.png'),
    }), [allSettings])

    const contact = useMemo(() => ({
        email: getSetting('contact_email', 'info@okjtech.co.ke'),
        phone: getSetting('contact_phone', '+254 700 000 000'),
        address: getSetting('contact_address', 'Nairobi, Kenya'),
    }), [allSettings])

    const socials = useMemo(() => ({
        linkedin: getSetting('social_linkedin', ''),
        twitter: getSetting('social_twitter', ''),
        github: getSetting('social_github', ''),
        facebook: getSetting('social_facebook', ''),
    }), [allSettings])

    return {
        settings: allSettings,
        getSetting,
        isEnabled,
        branding,
        contact,
        socials,
        isLoading,
        isError,
        mutate
    }
}
