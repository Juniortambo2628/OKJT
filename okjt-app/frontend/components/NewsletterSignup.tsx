"use client"

import React, { useState, useEffect } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

const NewsletterSignup = () => {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const { toast } = useToast()

    // Check for previous subscription on mount
    useEffect(() => {
        const subscribed = localStorage.getItem('okj_newsletter_subscribed')
        if (subscribed) {
            setIsSubscribed(true)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim() || isLoading) return

        setIsLoading(true)

        try {
            await api.post('/subscribe', { email, source: 'footer' })
            toast({
                title: "Subscribed!",
                description: "You've been successfully added to our newsletter.",
            })
            localStorage.setItem('okj_newsletter_subscribed', 'true')
            setIsSubscribed(true)
            setEmail('')
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Subscription Failed",
                description: err.response?.data?.message || 'Something went wrong. Please try again.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative overflow-hidden">
            <h4 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">Stay Informed</h4>
            
            <AnimatePresence mode="wait">
                {isSubscribed ? (
                    <motion.div
                        key="subscribed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 py-3 px-4 bg-primary/10 border border-primary/20 rounded-lg"
                    >
                        <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
                        <p className="text-muted-foreground text-xs leading-tight">
                            Thanks for subscribing! You&apos;re now on our priority update list.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="unsubscribed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <p className="text-muted-foreground text-sm mb-4">
                            Get the latest insights, market analysis, and advisory updates delivered to your inbox.
                        </p>
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="flex-1 bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-all"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2.5 rounded-lg text-sm font-bold bg-primary text-[#14110b] hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                {isLoading ? 'Sending...' : 'Join'}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default NewsletterSignup

