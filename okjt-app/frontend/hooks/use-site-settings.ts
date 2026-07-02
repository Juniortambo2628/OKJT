"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSettings } from './use-settings'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { SiteSetting } from '@/types/api'

export function useSiteSettings() {
    const { settings: allSettings, isLoading, mutate } = useSettings()
    const { toast } = useToast()
    const [localSettings, setLocalSettings] = useState<Record<string, string>>({})
    const [isSaving, setIsSaving] = useState(false)

    const settingsByGroup = useMemo(() => {
        if (allSettings.length === 0) return undefined
        const grouped: Record<string, SiteSetting[]> = {}
        allSettings.forEach((s) => {
            if (!grouped[s.group]) grouped[s.group] = []
            grouped[s.group].push(s)
        })
        return grouped
    }, [allSettings])

    useEffect(() => {
        if (allSettings.length > 0) {
            const flat: Record<string, string> = {}
            allSettings.forEach((s) => {
                flat[s.key] = s.value || ''
            })
            setLocalSettings(flat)
        }
    }, [allSettings])

    const updateSetting = useCallback((key: string, value: string) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }))
    }, [])

    const handleSave = useCallback(async (extraTransforms?: (settings: SiteSetting[], local: Record<string, string>) => Record<string, string>) => {
        if (allSettings.length === 0) return

        setIsSaving(true)
        try {
            let finalLocal = localSettings

            if (extraTransforms) {
                finalLocal = extraTransforms(allSettings, localSettings)
            }

            const settingsToUpdate = allSettings.map(s => ({
                key: s.key,
                value: finalLocal[s.key] || '',
                type: s.type,
                group: s.group,
            }))

            await api.put('/settings/batch', { settings: settingsToUpdate })
            toast({
                title: "Settings Saved",
                description: "All configurations have been updated.",
            })
            mutate()
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err.response?.data?.message || err.message || 'Failed to save settings',
            })
        } finally {
            setIsSaving(false)
        }
    }, [allSettings, localSettings, mutate, toast])

    return {
        settingsByGroup,
        localSettings,
        updateSetting,
        handleSave,
        isLoading,
        isSaving,
        mutate,
    }
}
