"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Image from 'next/image'
import { useSettings } from '@/hooks/use-settings'

interface AuthPageShellProps {
    title: string
    description: string
    children: React.ReactNode
}

export function AuthPageShell({ title, description, children }: AuthPageShellProps) {
    const { getSetting } = useSettings()
    const logo = getSetting('logo_dark', '/logos/OKJT-Logos/OKJTechLogo-White_Transparent.png')

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <Card className="w-full max-w-md bg-secondary/5 border-border shadow-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-6">
                        <Image
                            src={logo}
                            alt="OKJTech Logo"
                            width={200}
                            height={56}
                            className="h-14 w-auto"
                            priority
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>{children}</CardContent>
            </Card>
        </div>
    )
}
