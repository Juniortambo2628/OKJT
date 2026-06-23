import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, Zap, Landmark, Globe, Sparkles, Palette, Users, Rocket, TrendingUp, Code2, Cpu } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import ViewToggle from '@/components/ViewToggle'
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
