"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, Loader2, CheckCircle2, Mail, ShieldAlert, Clock } from 'lucide-react'
import Image from 'next/image'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface MaintenancePageProps {
    title: string
    description: string
    estimatedBack: string
}

export default function MaintenancePage({ title, description, estimatedBack }: MaintenancePageProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)
    const [isExpired, setIsExpired] = useState(false)
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const { toast } = useToast()

    // Countdown Timer logic
    useEffect(() => {
        if (!estimatedBack) return

        const targetDate = new Date(estimatedBack).getTime()

        const updateTimer = () => {
            const now = new Date().getTime()
            const difference = targetDate - now

            if (difference <= 0) {
                setIsExpired(true)
                setTimeLeft(null)
                return
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24))
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            setTimeLeft({ days, hours, minutes, seconds })
        };

        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [estimatedBack])

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            await api.post('/subscribe', { email, source: 'maintenance' })
            toast({
                title: "Successfully Subscribed!",
                description: "We'll notify you as soon as normal services are restored.",
            })
            setIsSubscribed(true)
            setEmail('')
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error Subscribing",
                description: err.response?.data?.message || "Something went wrong. Please try again.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#030712] text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter select-none">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full filter blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#030712_80%)]" />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="w-full max-w-4xl relative z-10 flex flex-col items-center text-center space-y-12">
                {/* Brand Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative h-12 w-48 mb-4"
                >
                    <Image
                        src="/logos/OKJT-Logos/OKJTechLogo-White_Transparent.png"
                        alt="OKJTech Logo"
                        fill
                        sizes="192px"
                        className="object-contain"
                        priority
                    />
                </motion.div>

                {/* Maintenance Warning Icon Badge */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/5 animate-pulse"
                >
                    <Wrench size={14} className="animate-bounce" />
                    Scheduled Maintenance Mode
                </motion.div>

                {/* Main Heading & Description */}
                <div className="space-y-6 max-w-2xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-white via-white to-muted-foreground bg-clip-text text-transparent leading-tight"
                    >
                        {title || "We'll Be Right Back"}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-muted-foreground text-base md:text-lg leading-relaxed font-light"
                    >
                        {description || "We are currently conducting essential system improvements to enhance your overall experience. Normal operations will resume shortly."}
                    </motion.p>
                </div>

                {/* Premium Countdown Timer */}
                {estimatedBack && !isExpired && timeLeft && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="w-full max-w-2xl bg-secondary/5 border border-border/40 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative group hover:border-primary/25 transition-all duration-500"
                    >
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

                        <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground/60 text-xs font-bold uppercase tracking-widest">
                            <Clock size={14} className="text-primary/70 animate-spin" style={{ animationDuration: '4s' }} />
                            Estimated Resumption Countdown
                        </div>

                        <div className="grid grid-cols-4 gap-4 md:gap-6 font-mono">
                            {[
                                { value: timeLeft.days, label: 'Days' },
                                { value: timeLeft.hours, label: 'Hours' },
                                { value: timeLeft.minutes, label: 'Mins' },
                                { value: timeLeft.seconds, label: 'Secs' }
                            ].map((unit, idx) => (
                                <div key={idx} className="flex flex-col items-center bg-[#070c1e] border border-white/5 rounded-xl p-3 md:p-5 relative overflow-hidden shadow-inner">
                                    <span className="text-3xl md:text-5xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                                        {String(unit.value).padStart(2, '0')}
                                    </span>
                                    <span className="text-[10px] md:text-xs text-muted-foreground/50 uppercase tracking-widest mt-2 font-bold font-inter">
                                        {unit.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Friendly Back-Soon Alert when Countdown Completes */}
                {isExpired && (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-xl bg-primary/5 border border-primary/20 backdrop-blur-lg rounded-xl p-4 flex items-center gap-3 text-left"
                    >
                        <ShieldAlert className="text-primary shrink-0 h-6 w-6" />
                        <div className="text-sm">
                            <span className="font-bold text-foreground block">Almost ready!</span>
                            <span className="text-muted-foreground text-xs">We are performing final checks and will be fully online momentarily. Thanks for your patience!</span>
                        </div>
                    </motion.div>
                )}

                {/* High-Fidelity Subscription Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="w-full max-w-md bg-secondary/5 border border-border/30 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl"
                >
                    <h3 className="font-bold text-base mb-2 text-foreground flex items-center justify-center gap-2">
                        <Mail size={16} className="text-primary" />
                        Notify Me on Live Restoration
                    </h3>
                    <p className="text-muted-foreground text-xs mb-6 font-light leading-relaxed">
                        Enter your email address to receive immediate priority notifications the second our system goes live.
                    </p>

                    <AnimatePresence mode="wait">
                        {isSubscribed ? (
                            <motion.div
                                key="subscribed"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/25 rounded-xl"
                            >
                                <CheckCircle2 className="text-primary h-6 w-6 shrink-0" />
                                <p className="text-muted-foreground text-xs leading-normal text-left">
                                    <strong>Subscription verified!</strong> You will receive a notification as soon as services are fully restored.
                                </p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address..."
                                    className="flex-1 bg-background/60 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/45 outline-none focus:border-primary/50 transition-all font-inter"
                                    required
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-3 rounded-xl text-sm font-bold bg-primary text-[#050a1a] hover:bg-primary/95 shadow-lg shadow-primary/15 transition-all flex items-center gap-2 disabled:opacity-50 font-inter"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        "Subscribe"
                                    )}
                                </button>
                            </form>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer Copyright */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-xs text-muted-foreground/40 font-light"
                >
                    © {new Date().getFullYear()} OKJTech. All rights reserved. Design-led engineering.
                </motion.div>
            </div>
        </div>
    )
}
