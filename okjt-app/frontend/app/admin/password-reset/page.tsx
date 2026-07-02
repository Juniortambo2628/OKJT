"use client"

import React, { Suspense, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import api from '@/lib/api'
import { useSearchParams } from 'next/navigation'
import { AuthPageShell } from '@/components/admin/AuthPageShell'

const PasswordResetPage = () => {
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
        <AuthPageShell
            title={token ? 'Reset Password' : 'Forgot Password'}
            description={token ? 'Enter your new password below.' : 'Enter your email to receive a password reset link.'}
        >
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
        </AuthPageShell>
    )
}

export default function PasswordResetPageWrapper() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center" />}>
            <PasswordResetPage />
        </Suspense>
    )
}
