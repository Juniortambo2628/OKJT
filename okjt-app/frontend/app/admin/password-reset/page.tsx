"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { useApi } from '@/hooks/use-api'
import api from '@/lib/api'
import { useSearchParams } from 'next/navigation'

const PasswordResetPage = () => {
    const { data: settingsByGroup } = useApi('/settings')
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const emailParam = searchParams.get('email')

    const [email, setEmail] = useState(emailParam || '')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isRequestSent, setIsRequestSent] = useState(false)

    const getSetting = (key: string, defaultValue: string) => {
        if (!settingsByGroup) return defaultValue
        const allSettings = Object.values(settingsByGroup).flat() as any[]
        const setting = allSettings.find(s => s.key === key)
        return setting?.value || defaultValue
    }

    const logo = getSetting('logo_dark', '/assets/logos/logo-dark-bg.png')

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setIsLoading(true)
        try {
            await api.post('/password/reset', { email })
            setSuccess('Password reset link has been sent to your email.')
            setIsRequestSent(true)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset link. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (password !== passwordConfirmation) {
            setError('Passwords do not match.')
            return
        }

        setIsLoading(true)
        try {
            await api.post('/password/reset/confirm', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            })
            setSuccess('Password has been reset successfully. You can now sign in.')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
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
                    <CardTitle className="text-2xl font-bold">
                        {token ? 'Reset Password' : 'Forgot Password'}
                    </CardTitle>
                    <CardDescription>
                        {token
                            ? 'Enter your new password below.'
                            : 'Enter your email to receive a password reset link.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {token ? (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
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
                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
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
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleRequestReset} className="space-y-4">
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
                                    autoFocus
                                    className="bg-background/50"
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            {success && <p className="text-sm text-emerald-500">{success}</p>}
                            <Button type="submit" className="w-full h-11" disabled={isLoading || isRequestSent}>
                                {isLoading ? 'Sending...' : isRequestSent ? 'Link Sent' : 'Send Reset Link'}
                            </Button>
                        </form>
                    )}
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        <Link href="/admin/login" className="text-primary hover:underline">
                            Back to Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default PasswordResetPage
