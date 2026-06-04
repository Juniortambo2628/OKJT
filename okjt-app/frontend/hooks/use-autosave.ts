import { useEffect, useRef, useState } from 'react'
import api from '@/lib/api'

interface UseAutosaveProps {
    data: any
    onSaveSuccess?: () => void
    endpoint?: string // If provided, will PUT to this endpoint
    localStorageKey?: string // If provided, will save to localStorage
    delay?: number
    enabled?: boolean
}

export const useAutosave = ({
    data,
    onSaveSuccess,
    endpoint,
    localStorageKey,
    delay = 2000,
    enabled = true
}: UseAutosaveProps) => {
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [error, setError] = useState<string | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const initialRender = useRef(true)

    useEffect(() => {
        if (!enabled) return

        if (initialRender.current) {
            initialRender.current = false
            return
        }

        if (timerRef.current) clearTimeout(timerRef.current)

        timerRef.current = setTimeout(async () => {
            setIsSaving(true)
            setError(null)
            try {
                if (endpoint) {
                    await api.put(endpoint, data)
                }
                if (localStorageKey) {
                    localStorage.setItem(localStorageKey, JSON.stringify(data))
                }
                setLastSaved(new Date())
                onSaveSuccess?.()
            } catch (err: any) {
                console.error('Autosave failed:', err)
                setError(err.response?.data?.message || 'Autosave failed')
            } finally {
                setIsSaving(false)
            }
        }, delay)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [data, delay, enabled, endpoint, localStorageKey, onSaveSuccess])

    return { isSaving, lastSaved, error }
}
