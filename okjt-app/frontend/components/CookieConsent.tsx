"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCookieConsent } from './CookieConsentProvider'
import { Cookie, Shield, BarChart3, Megaphone, X, Settings2 } from 'lucide-react'

const CookieConsent = () => {
    const { showBanner, showPreferences, setShowPreferences, acceptAll, rejectAll, consent, updateConsent, savePreferences } = useCookieConsent()

    if (!showBanner && !showPreferences) return null

    const categories = [
        { key: 'essential' as const, label: 'Essential', icon: Shield, description: 'Required for the site to function. Cannot be disabled.', locked: true },
        { key: 'analytics' as const, label: 'Analytics', icon: BarChart3, description: 'Help us understand how visitors interact with the site.' },
        { key: 'marketing' as const, label: 'Marketing', icon: Megaphone, description: 'Used to deliver relevant content and measure campaign effectiveness.' },
    ]

    return (
        <AnimatePresence>
            {/* Banner */}
            {showBanner && !showPreferences && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="fixed bottom-0 left-0 right-0 z-[90] p-4 md:p-6"
                >
                    <div className="max-w-5xl mx-auto bg-background border border-border rounded-xl shadow-2xl shadow-black/50 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                                <Cookie size={28} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-foreground font-bold text-lg mb-2">We value your privacy</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    We use cookies to enhance your experience, analyse site traffic, and personalise content.
                                    You can choose which categories to allow. Essential cookies are always active as they are necessary for the site to function.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                                <button
                                    onClick={() => setShowPreferences(true)}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-foreground/70 border border-border rounded-lg hover:bg-foreground/5 transition-all"
                                >
                                    <Settings2 size={14} /> Manage
                                </button>
                                <button
                                    onClick={rejectAll}
                                    className="px-5 py-2.5 text-sm font-bold text-foreground/70 border border-border rounded-lg hover:bg-foreground/5 transition-all"
                                >
                                    Reject All
                                </button>
                                <button
                                    onClick={acceptAll}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    Accept All
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Preferences Modal */}
            {showPreferences && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[95] flex items-center justify-center p-4"
                 >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPreferences(false)} />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-background border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h3 className="text-foreground font-bold text-lg">Cookie Preferences</h3>
                            <button onClick={() => setShowPreferences(false)} className="text-muted-foreground/40 hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                            {categories.map(cat => {
                                const Icon = cat.icon
                                return (
                                    <div key={cat.key} className="flex items-start gap-4 p-4 rounded-lg bg-foreground/5 border border-border">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-foreground font-bold text-sm">{cat.label}</h4>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={consent[cat.key]}
                                                        onChange={(e) => updateConsent(cat.key, e.target.checked)}
                                                        disabled={cat.locked}
                                                        className="sr-only peer"
                                                    />
                                                    <div className={`w-9 h-5 rounded-full transition-all ${cat.locked ? 'bg-primary/50 cursor-not-allowed' : 'bg-foreground/20 peer-checked:bg-primary'}`}>
                                                        <div className={`w-4 h-4 bg-white rounded-full transition-all mt-0.5 ${consent[cat.key] ? 'ml-4' : 'ml-0.5'}`} />
                                                    </div>
                                                </label>
                                            </div>
                                            <p className="text-muted-foreground/40 text-xs mt-1">{cat.description}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button onClick={rejectAll} className="px-5 py-2.5 text-sm font-bold text-foreground/70 border border-border rounded-lg hover:bg-foreground/5">
                                Reject All
                            </button>
                            <button onClick={savePreferences} className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20">
                                Save Preferences
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default CookieConsent
