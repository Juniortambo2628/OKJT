"use client"

import React, { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { useApi } from '@/hooks/use-api'
import api from '@/lib/api'

const RegisterPage = () => {
    const { data: settingsByGroup } = useApi('/settings')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()

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
        setSuccess('')
        
        if (password !== passwordConfirmation) {
            setError('Passwords do not match.')
            return
        }

        setIsLoading(true)
        try {
            await api.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            })
            await login({ email, password })
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.')
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
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>Register to access the admin portal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoComplete="name"
                                autoFocus
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@okjtech.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                                autoComplete="new-password"
                                className="bg-background/50"
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        {success && <p className="text-sm text-emerald-500">{success}</p>}
                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Register'}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/admin/login" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default RegisterPage
