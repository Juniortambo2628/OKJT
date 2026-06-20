"use client"

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Loader2, Layout, Zap, BarChart3, Image as ImageIcon, Film, FileText, Mail, Briefcase } from 'lucide-react'

import ImageUploader from '@/components/admin/ImageUploader'
import api from '@/lib/api'

// Section configuration — defines which fields are editable for each section
const sectionConfig = [
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
            { key: 'vp_energy_image', label: 'Energy Advisory Background Image', type: 'image' },
            { key: 'vp_fintech_image', label: 'Fintech Background Image', type: 'image' },
            { key: 'vp_diplomacy_image', label: 'International Diplomacy Background Image', type: 'image' },
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
            { key: 'services_video_energy', label: 'Video: Energy Advisory', type: 'image', accept: ['.mp4'] },
            { key: 'services_video_fintech', label: 'Video: Fintech', type: 'image', accept: ['.mp4'] },
            { key: 'services_video_diplomacy', label: 'Video: International Diplomacy', type: 'image', accept: ['.mp4'] },
        ],
    },
]


const AdminContentPage = () => {
    const { data: settingsByGroup, mutate, isLoading } = useApi('/settings')
    const [formValues, setFormValues] = useState<Record<string, string>>({})
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [activeTab, setActiveTab] = useState('hero')

    // Flatten grouped settings into a key-value map
    useEffect(() => {
        if (settingsByGroup) {
            const flat: Record<string, string> = {}
            Object.values(settingsByGroup).forEach((group: any) => {
                group.forEach((s: any) => { flat[s.key] = s.value || '' })
            })
            setFormValues(flat)
        }
    }, [settingsByGroup])

    const handleChange = (key: string, value: string) => {
        setFormValues((prev) => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        setSaveSuccess(false)
        try {
            const activeSection = sectionConfig.find((s) => s.id === activeTab)
            if (!activeSection) return

            const settings = activeSection.fields.map((f) => ({
                key: f.key,
                value: formValues[f.key] || '',
                type: f.type === 'image' ? 'image' : 'text',
                group: activeSection.id,
            }))

            await api.put('/settings/batch', { settings })
            mutate()
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch {
            alert('Failed to save settings')
        } finally {
            setIsSaving(false)
        }
    }

    const activeSection = sectionConfig.find((s) => s.id === activeTab)

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Content Manager</h1>
                        <p className="text-muted-foreground">Edit homepage section text, images, and hero backgrounds.</p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`gap-2 px-8 font-bold shadow-xl ${saveSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'shadow-primary/20'}`}
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saveSuccess ? 'Saved!' : 'Save Changes'}
                    </Button>
                </div>

                {/* Section Tabs */}
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

                {/* Active Section Editor */}
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
                    <Card className="bg-secondary/10 border-border/50">
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
                                <div key={field.key}>
                                    {field.type === 'text' && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-foreground/80">{field.label}</Label>
                                            <Input
                                                value={formValues[field.key] || ''}
                                                onChange={(e) => handleChange(field.key, e.target.value)}
                                                placeholder={field.placeholder}
                                                className="bg-background/50"
                                            />
                                        </div>
                                    )}
                                    {field.type === 'textarea' && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-foreground/80">{field.label}</Label>
                                            <textarea
                                                value={formValues[field.key] || ''}
                                                onChange={(e) => handleChange(field.key, e.target.value)}
                                                placeholder={field.placeholder}
                                                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background/50 text-sm resize-y"
                                            />
                                        </div>
                                    )}
                                    {field.type === 'image' && (
                                        <ImageUploader
                                            label={field.label}
                                            value={formValues[field.key] || ''}
                                            onChange={(url) => handleChange(field.key, url)}
                                            accept={(field as any).accept}
                                            maxSizeMB={10}
                                        />
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminContentPage
