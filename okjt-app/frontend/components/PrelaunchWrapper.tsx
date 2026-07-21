"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import MaintenancePage from './MaintenancePage'
import api from '@/lib/api'

interface PrelaunchWrapperProps {
    children: React.ReactNode
    launchSettings: {
        isActive: boolean
        title: string
        description: string
        estimatedBack: string
    } | null
}

export default function PrelaunchWrapper({ children, launchSettings: initialSettings }: PrelaunchWrapperProps) {
    const pathname = usePathname()
    const [maintenanceSettings, setMaintenanceSettings] = React.useState(initialSettings)
    
    // Polling for maintenance settings changes
    React.useEffect(() => {
        const checkSettings = async () => {
            try {
                const { data } = await api.get('/site-settings/maintenance')
                if (data && JSON.stringify(data) !== JSON.stringify(maintenanceSettings)) {
                    setMaintenanceSettings(data)
                }
            } catch (error) {
                // Silently log or handle network error without interrupting UI thread execution
                console.warn('Failed to poll maintenance settings (Network or Server Offline):', error)
            }
        }

        const interval = setInterval(checkSettings, 10000) // Poll every 10s
        return () => clearInterval(interval)
    }, [maintenanceSettings])

    // Always permit access to the admin dashboard
    if (pathname?.startsWith('/admin')) {
        return <>{children}</>
    }

    // If Maintenance Mode is active globally, take over the screen
    if (maintenanceSettings?.isActive) {
        return (
            <MaintenancePage 
                title={maintenanceSettings.title}
                description={maintenanceSettings.description}
                estimatedBack={maintenanceSettings.estimatedBack}
            />
        )
    }

    return <>{children}</>
}
