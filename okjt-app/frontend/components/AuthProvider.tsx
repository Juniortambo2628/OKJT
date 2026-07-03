"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface AuthContextType {
    user: any | null
    login: (credentials: any) => Promise<void>
    logout: () => Promise<void>
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            api.get('/user')
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('auth_token')
                    delete api.defaults.headers.common['Authorization']
                })
                .finally(() => setIsLoading(false))
        } else {
            setIsLoading(false)
        }
    }, [])

    const login = async (credentials: any) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
        console.log('[AUTH] Login start. baseUrl=', baseUrl, 'email=', credentials.email);

        try {
            await axios.get(`${baseUrl}/sanctum/csrf-cookie`, { withCredentials: true });
            console.log('[AUTH] CSRF cookie fetched');
        } catch (csrfErr: any) {
            console.warn('[AUTH] CSRF cookie fetch failed (non-fatal):', csrfErr.message, csrfErr.response?.status, csrfErr.response?.data);
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
        } catch (err: any) {
            console.error('[AUTH] POST /login error:', err);
            console.error('[AUTH] error.message:', err.message);
            console.error('[AUTH] error.code:', err.code);
            console.error('[AUTH] error.response:', err.response);
            console.error('[AUTH] error.request:', err.request);
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
