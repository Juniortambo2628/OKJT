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
        await axios.get(`${baseUrl}/sanctum/csrf-cookie`, { withCredentials: true });

        const res = await api.post('/login', credentials)
        const { token, user } = res.data
        localStorage.setItem('auth_token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
        router.push('/admin/dashboard')
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
