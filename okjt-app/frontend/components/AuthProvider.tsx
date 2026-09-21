"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { User } from '@/types/api'

interface AuthContextType {
    user: User | null
    login: (credentials: { email: string; password: string }) => Promise<void>
    logout: () => Promise<void>
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
        // Route both the token and no-token cases through a promise so the only
        // setIsLoading call is in .finally() (never synchronous in the effect body).
        const settle = token
            ? api.get('/user')
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('auth_token')
                    delete api.defaults.headers.common['Authorization']
                })
            : Promise.resolve()
        settle.finally(() => setIsLoading(false))
    }, [])

    const login = async (credentials: { email: string; password: string }) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000';
        console.log('[AUTH] Login start. baseUrl=', baseUrl, 'email=', credentials.email);

        try {
            await axios.get(`${baseUrl}/sanctum/csrf-cookie`, { withCredentials: true });
            console.log('[AUTH] CSRF cookie fetched');
        } catch (csrfErr: unknown) {
            const msg = csrfErr instanceof Error ? csrfErr.message : String(csrfErr)
            console.warn('[AUTH] CSRF cookie fetch failed (non-fatal):', msg);
        }

        try {
            console.log('[AUTH] Sending POST /login');
            const res = await api.post('/login', credentials)
            console.log('[AUTH] POST /login response status=', res.status, 'data=', res.data);
            const { token, user } = res.data
            localStorage.setItem('auth_token', token)
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            setUser(user)
            router.push('/admin/dashboard')
        } catch (err: unknown) {
            console.error('[AUTH] POST /login error:', err);
            const axiosErr = err as { message?: string; code?: string; response?: unknown; request?: unknown }
            console.error('[AUTH] error.message:', axiosErr.message);
            console.error('[AUTH] error.code:', axiosErr.code);
            console.error('[AUTH] error.response:', axiosErr.response);
            console.error('[AUTH] error.request:', axiosErr.request);
            throw err;
        }
    }

    const logout = async () => {
        await api.post('/logout')
        localStorage.removeItem('auth_token')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
        router.push('/admin/login')
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
