"use client"

import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useApi } from '@/hooks/use-api'
import { motion } from 'framer-motion'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LegalPageLayoutProps {
    title: string
    settingKey: string
    lastUpdated?: string
}

export default function LegalPageLayout({ title, settingKey, lastUpdated = 'March 2026' }: LegalPageLayoutProps) {
    const { data: settingsByGroup, isLoading } = useApi('/settings')

    const content = React.useMemo(() => {
        if (!settingsByGroup) return ''
        const allSettings = Object.values(settingsByGroup).flat() as any[]
        const setting = allSettings.find(s => s.key === settingKey)
        return setting?.value || '<p>Content is being updated. Please check back shortly.</p>'
    }, [settingsByGroup, settingKey])

    const handlePrint = () => {
        window.print()
    }

    return (
        <main className="flex min-h-screen flex-col bg-background">
            <Navbar />

            {/* Simple Hero */}
            <section className="pt-32 pb-16 bg-[#020810] border-b border-white/5">
                <div className="max-w-[1400px] mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{title}</h1>
                        <div className="flex items-center gap-6 text-sm text-white/50">
                            <span>Last Updated: {lastUpdated}</span>
                            <button 
                                onClick={handlePrint}
                                className="flex items-center gap-2 hover:text-primary transition-colors border-l border-white/10 pl-6"
                            >
                                <Printer size={14} />
                                Print Document
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 bg-white text-slate-900">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="max-w-3xl">
                        {isLoading ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-slate-100 rounded w-3/4" />
                                <div className="h-4 bg-slate-100 rounded w-full" />
                                <div className="h-4 bg-slate-100 rounded w-5/6" />
                                <div className="h-40 bg-slate-50 rounded w-full mt-8" />
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="prose prose-slate lg:prose-lg max-w-none 
                                    prose-headings:text-slate-900 prose-headings:font-bold
                                    prose-p:text-slate-600 prose-p:leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        )}

                        <div className="mt-20 pt-10 border-t border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-4">Questions about our policies?</h4>
                            <p className="text-slate-600 mb-8">If you have any questions or concerns regarding our legal documentation, please reach out to our legal team.</p>
                            <Button asChild variant="outline" className="rounded-none border-slate-200">
                                <a href="/contact">Contact Legal Team</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            <style jsx global>{`
                @media print {
                    nav, footer, .pt-32, .mt-20 { display: none !important; }
                    main { background: white !important; }
                    .py-20 { padding: 0 !important; }
                    .prose { max-width: 100% !important; color: black !important; }
                }
            `}</style>
        </main>
    )
}
