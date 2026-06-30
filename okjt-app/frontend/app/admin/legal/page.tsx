"use client"

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShieldCheck, FileText, Cookie } from 'lucide-react'
import RichTextEditor from '@/components/admin/RichTextEditor'
import SettingsHeader from '@/components/admin/core/SettingsHeader'

const LegalSettingsPage = () => {
    const { localSettings, updateSetting, handleSave, isLoading, isSaving } = useSiteSettings()
    const [activeTab, setActiveTab] = useState('privacy')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSaveLegal = async () => {
        await handleSave((settings, local) => {
            const legalKeys = ['privacy_policy', 'terms_of_service', 'cookie_policy']
            const updated = { ...local }
            legalKeys.forEach(key => {
                if (!(key in updated)) updated[key] = ''
            })
            return updated
        })
    }

    const tabs = [
        { id: 'privacy', title: 'Privacy Policy', key: 'privacy_policy', icon: ShieldCheck },
        { id: 'terms', title: 'Terms of Service', key: 'terms_of_service', icon: FileText },
        { id: 'cookies', title: 'Cookie Policy', key: 'cookie_policy', icon: Cookie },
    ]

    const activeTabData = tabs.find(t => t.id === activeTab)

    return (
        <AdminLayout>
            <div className="space-y-8">
                <SettingsHeader
                    title="Legal Content Management"
                    description="Manage your website's legal documents with a rich text editor."
                    onSave={handleSaveLegal}
                    isSaving={isSaving}
                    isLoading={isLoading}
                />

                <div className="flex gap-2 border-b border-border/50">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-primary text-primary bg-primary/5'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20'
                                }`}
                            >
                                <Icon size={16} />
                                {tab.title}
                            </button>
                        )
                    })}
                </div>

                {!mounted || isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-[500px] bg-secondary/10 rounded-xl border border-border/50" />
                    </div>
                ) : activeTabData && (
                    <Card className="bg-secondary/10 border-border/50">
                        <CardHeader className="border-b border-border/50 bg-secondary/5">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <activeTabData.icon size={20} className="text-primary" />
                                {activeTabData.title}
                            </CardTitle>
                            <CardDescription>
                                This content will be displayed on the public /{(activeTabData.id === 'cookies' ? 'cookies' : activeTabData.id === 'terms' ? 'terms' : 'privacy')} page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <RichTextEditor 
                                value={localSettings[activeTabData.key] || ''} 
                                onChange={(val) => updateSetting(activeTabData.key, val)}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    )
}

export default LegalSettingsPage
