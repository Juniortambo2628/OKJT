"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { AdminThemeProvider } from '@/components/admin/AdminThemeProvider'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/admin/login')
        }
    }, [user, isLoading, router])

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    if (!user) return null

    return (
        <AdminThemeProvider>
            <div className="min-h-screen bg-background">
                <AdminSidebar />
                <main className="ml-64 p-8">
                    {children}
                </main>
            </div>
        </AdminThemeProvider>
    )
}

export default AdminLayout
