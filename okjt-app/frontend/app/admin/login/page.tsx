"use client"

import React, { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Image from 'next/image'
import { useApi } from '@/hooks/use-api'

const LoginPage = () => {
    const { data: settingsByGroup } = useApi('/settings')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()

    // Helper to get setting value
    const getSetting = (key: string, defaultValue: string) => {
        if (!settingsByGroup) return defaultValue
        const allSettings = Object.values(settingsByGroup).flat() as any[]
        const setting = allSettings.find(s => s.key === key)
        return setting?.value || defaultValue
    }

    const logo = getSetting('logo_dark', '/assets/logos/logo-dark-bg.png')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        try {
            await login({ email, password })
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <Card className="w-full max-w-md bg-secondary/10 border-border/50">
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
                        <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
                        <CardDescription>Enter your credentials to manage OKJTech.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="admin@okjtech.com" 
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                autoFocus
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="bg-background/50"
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default LoginPage
