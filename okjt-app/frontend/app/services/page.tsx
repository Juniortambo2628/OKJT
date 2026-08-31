import React from 'react'
import SWRProvider from '@/components/SWRProvider'
import { getSettings, getServices, getPillars } from '@/lib/server/api'
import ServicesIndexContent from './ServicesIndexContent'

export const revalidate = 60

export default async function ServicesIndexPage() {
    const [settings, services, pillars] = await Promise.all([
        getSettings(),
        getServices(),
        getPillars(),
    ])

    return (
        <SWRProvider fallback={{
            '/settings': settings,
            '/services': services,
            '/pillars': pillars,
        }}>
            <ServicesIndexContent />
        </SWRProvider>
    )
}
