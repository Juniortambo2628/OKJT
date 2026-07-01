"use client"

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Layout, Zap, BarChart3, FileText, Mail, Briefcase } from 'lucide-react'
import SettingsHeader from '@/components/admin/core/SettingsHeader'
import SettingsFieldInput, { SettingsFieldConfig } from '@/components/admin/core/SettingsField'

const sectionConfig: { id: string; title: string; description: string; icon: React.ElementType; fields: SettingsFieldConfig[] }[] = [
    {
        id: 'hero',
        title: 'Hero Section',
        description: 'Main landing page hero text and headlines.',
        icon: Layout,
        fields: [
            { key: 'hero_tagline', label: 'Tagline', type: 'text', placeholder: 'e.g. Trusted by governments...' },
            { key: 'hero_title_line1', label: 'Title Line 1', type: 'text', placeholder: 'e.g. Navigating' },
            { key: 'hero_rotating_words', label: 'Rotating Words (comma-separated)', type: 'text', placeholder: 'e.g. Complexity.,Uncertainty.,Volatility.' },
            { key: 'hero_title_line2', label: 'Title Line 2', type: 'text', placeholder: 'e.g. Empowering Change.' },
            { key: 'hero_subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Strategic advisory, market intelligence...' },
        ],
    },
    {
        id: 'value_proposition',
        title: 'Three Pillars Section',
        description: 'The "Three Pillars of Trusted Intelligence" section.',
        icon: Zap,
        fields: [
            { key: 'vp_section_tagline', label: 'Section Tagline', type: 'text', placeholder: 'e.g. What We Do' },
            { key: 'vp_section_title', label: 'Section Title', type: 'text', placeholder: 'e.g. Three Pillars of Trusted Intelligence' },
            { key: 'vp_section_subtitle', label: 'Section Subtitle', type: 'textarea', placeholder: 'We connect decision-makers...' },
        ],
    },
    {
        id: 'stats',
        title: 'Stats Section',
        description: 'Key performance figures displayed on the homepage.',
        icon: BarChart3,
        fields: [
            { key: 'stats_section_tagline', label: 'Section Tagline', type: 'text', placeholder: 'e.g. By The Numbers' },
            { key: 'stats_section_title', label: 'Section Title', type: 'text', placeholder: 'e.g. Our Impact in Numbers' },
        ],
    },
    {
        id: 'about',
        title: 'About Page',
        description: 'Manage the mission, vision, and core narrative of OKJTech.',
        icon: FileText,
        fields: [
            { key: 'about_title', label: 'Page Title', type: 'text', placeholder: 'e.g. Intelligence for the Future' },
            { key: 'about_tagline', label: 'Page Tagline', type: 'text', placeholder: 'e.g. Our Mission & Vision' },
            { key: 'about_story', label: 'Our Story (Hero Subtitle)', type: 'textarea', placeholder: 'OKJTech was founded...' },
            { key: 'about_mission_title', label: 'Mission Title', type: 'text', placeholder: 'e.g. Connecting decision-makers...' },
            { key: 'about_mission_text1', label: 'Mission Text Block 1', type: 'textarea' },
            { key: 'about_mission_text2', label: 'Mission Text Block 2', type: 'textarea' },
        ],
    },
    {
        id: 'contact',
        title: 'Region & Socials',
        description: 'Update regional office details and social media connectivity.',
        icon: Mail,
        fields: [
            { key: 'contact_email', label: 'Primary Contact Email', type: 'text', placeholder: 'info@okjtech.co.ke' },
            { key: 'contact_phone', label: 'Official Phone Number', type: 'text', placeholder: '+254 700 000 000' },
            { key: 'contact_address', label: 'Headquarters Address', type: 'textarea', placeholder: 'Nairobi, Kenya' },
            { key: 'contact_map_url', label: 'Google Maps Embed URL', type: 'text', placeholder: 'https://www.google.com/maps/embed?...' },
            { key: 'social_linkedin', label: 'LinkedIn Profile URL', type: 'text', placeholder: 'https://linkedin.com/company/...' },
            { key: 'social_twitter', label: 'Twitter/X URL', type: 'text', placeholder: 'https://twitter.com/...' },
            { key: 'social_github', label: 'GitHub Organization URL', type: 'text', placeholder: 'https://github.com/...' },
            { key: 'social_facebook', label: 'Facebook Page URL', type: 'text', placeholder: 'https://facebook.com/...' },
        ],
    },
    {
        id: 'services',
        title: 'Services Section',
        description: 'Manage heading text for the main services grid.',
        icon: Briefcase,
        fields: [
            { key: 'services_tagline', label: 'Section Tagline', type: 'text', placeholder: 'Our Services' },
            { key: 'services_title', label: 'Section Title', type: 'text', placeholder: 'Explore our portfolio' },
        ],
    },
]

const AdminContentPage = () => {
    const { localSettings, updateSetting, handleSave, isLoading, isSaving } = useSiteSettings()
    const [activeTab, setActiveTab] = useState('hero')

    const activeSection = sectionConfig.find((s) => s.id === activeTab)

    const handleSaveSection = async () => {
        if (!activeSection) return
        await handleSave((settings, local) => {
            const updated = { ...local }
            activeSection.fields.forEach(f => {
                if (!(f.key in updated)) updated[f.key] = ''
            })
            return updated
        })
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <SettingsHeader
                    title="Content Manager"
                    description="Edit homepage section text, images, and hero backgrounds."
                    onSave={handleSaveSection}
                    isSaving={isSaving}
                    isLoading={isLoading}
                />

                <div className="flex gap-2 border-b border-border/50 pb-0">
                    {sectionConfig.map((section) => {
                        const Icon = section.icon
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveTab(section.id)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all border-b-2 ${
                                    activeTab === section.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                }`}
                            >
                                <Icon size={16} />
                                {section.title}
                            </button>
                        )
                    })}
                </div>

                {isLoading ? (
                    <div className="space-y-6 animate-pulse">
                        <div className="bg-secondary/10 border border-border/50 rounded-xl h-[500px] flex flex-col">
                            <div className="p-6 border-b border-border/50 bg-secondary/5 space-y-2">
                                <div className="h-6 w-48 bg-secondary/20 rounded" />
                                <div className="h-4 w-64 bg-secondary/20 rounded" />
                            </div>
                            <div className="p-6 space-y-8">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="space-y-3">
                                        <div className="h-4 w-24 bg-secondary/20 rounded" />
                                        <div className="h-12 w-full bg-secondary/10 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : activeSection && (
                    <Card className="bg-secondary/5 border-border shadow-sm">
                        <CardHeader className="border-b border-border/50 bg-secondary/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <activeSection.icon size={20} />
                                </div>
                                <div>
                                    <CardTitle>{activeSection.title}</CardTitle>
                                    <CardDescription>{activeSection.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {activeSection.fields.map((field) => (
                                <SettingsFieldInput
                                    key={field.key}
                                    config={field}
                                    value={localSettings[field.key] || ''}
                                    onChange={updateSetting}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminContentPage
