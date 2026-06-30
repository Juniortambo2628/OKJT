"use client"

import { useState, useEffect, useCallback } from 'react'
import { useApi } from '@/hooks/use-api'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { SiteSetting } from '@/types/api'

export function useSiteSettings() {
    const { data: settingsByGroup, mutate, isLoading } = useApi<Record<string, SiteSetting[]>>('/settings')
    const { toast } = useToast()
    const [localSettings, setLocalSettings] = useState<Record<string, string>>({})
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (settingsByGroup) {
            const flat: Record<string, string> = {}
            Object.values(settingsByGroup).flat().forEach((s) => {
                flat[s.key] = s.value || ''
            })
            setLocalSettings(flat)
        }
    }, [settingsByGroup])

    const updateSetting = useCallback((key: string, value: string) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }))
    }, [])

    const handleSave = useCallback(async (extraTransforms?: (settings: SiteSetting[], local: Record<string, string>) => Record<string, string>) => {
        if (!settingsByGroup) return

        setIsSaving(true)
        try {
            const allSettings = Object.values(settingsByGroup).flat()
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
    }, [settingsByGroup, localSettings, mutate, toast])

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
