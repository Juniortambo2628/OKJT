"use client"

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Save, RefreshCw, Globe, Palette, ShieldCheck, Mail, GripVertical, Plus, Trash2, Layout, Film, Image as ImageIcon, ListOrdered } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import api from '@/lib/api'
import ImageUploader from '@/components/admin/ImageUploader'
import { SiteSetting } from '@/types/api'
import { useToast } from '@/hooks/use-toast'
import { Reorder } from 'framer-motion'
import { getMediaUrl } from '@/lib/utils'

const AdminSettingsPage = () => {
    const { data: settingsByGroup, mutate, isLoading } = useApi<Record<string, SiteSetting[]>>('/settings')
    const { toast } = useToast()
    const [localSettings, setLocalSettings] = useState<Record<string, string>>({})
    const [navLinks, setNavLinks] = useState<{name: string, href: string}[]>([])
    const [isSavingAll, setIsSavingAll] = useState(false)

    // Sync local state when data loads
    React.useEffect(() => {
        if (settingsByGroup) {
            const flat: Record<string, string> = {}
            Object.values(settingsByGroup).forEach((group) => {
                group.forEach((s) => {
                    flat[s.key] = s.value || ''
                    if (s.key === 'main_nav_links') {
                        try {
                            setNavLinks(JSON.parse(s.value || '[]'))
                        } catch (e) {
                            console.error("Failed to parse local nav links", e)
                        }
                    }
                })
            })
            setLocalSettings(flat)
        }
    }, [settingsByGroup])

    const heroSettingsList = [
        { key: 'hero_home_video_1', label: 'Home Hero Video 1', type: 'video' },
        { key: 'hero_home_video_2', label: 'Home Hero Video 2', type: 'video' },
        { key: 'hero_home_video_3', label: 'Home Hero Video 3', type: 'video' },
        { key: 'hero_about_media', label: 'About Page Hero', type: 'media' },
        { key: 'hero_products_media', label: 'Our Approach Hero', type: 'media' },
        { key: 'hero_services_media', label: 'Services Page Hero', type: 'media' },
        { key: 'hero_insights_media', label: 'Insights Page Hero', type: 'media' },
        { key: 'hero_case_studies_media', label: 'Case Studies Hero', type: 'media' },
        { key: 'hero_client_impact_media', label: 'Client Impact Hero', type: 'media' },
        { key: 'hero_contact_media', label: 'Contact Page Hero', type: 'media' },
        { key: 'hero_consultation_media', label: 'Consultation Hero', type: 'media' },
        { key: 'stats_background', label: 'Stats Section Background', type: 'media' },
        { key: 'hero_pillar_web_engineering', label: 'Pillar: Web Engineering Hero', type: 'media' },
        { key: 'hero_pillar_ui_ux_design', label: 'Pillar: UI/UX Design Hero', type: 'media' },
        { key: 'hero_pillar_digital_strategy', label: 'Pillar: Digital Strategy Hero', type: 'media' },
        { key: 'hero_pillar_energy_advisory', label: 'Pillar: Energy Advisory Hero', type: 'media' },
        { key: 'hero_pillar_fintech', label: 'Pillar: Fintech Hero', type: 'media' },
        { key: 'hero_pillar_international_diplomacy', label: 'Pillar: Diplomacy Hero', type: 'media' },
    ]

    const heroSettingByKey = heroSettingsList.reduce<Record<string, typeof heroSettingsList[number]>>((acc, setting) => {
        acc[setting.key] = setting
        return acc
    }, {})

    const getHeroAccept = (type: string) => {
        if (type === 'video') return ['.mp4', '.webm']
        return ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm']
    }

    const handleSaveAll = async () => {
        setIsSavingAll(true)
        try {
            const allSettings: SiteSetting[] = []
            if (settingsByGroup) {
                Object.values(settingsByGroup).forEach(group => {
                    allSettings.push(...group)
                })
            }

            const settingsToUpdate = Object.entries(localSettings).map(([key, value]) => {
                const original = allSettings.find(s => s.key === key)
                const heroSetting = heroSettingByKey[key]
                let finalValue = value
                
                if (key === 'main_nav_links') {
                    finalValue = JSON.stringify(navLinks)
                }

                return {
                    key,
                    value: finalValue,
                    type: original?.type || (heroSetting?.type === 'video' ? 'video' : heroSetting ? 'image' : 'text'),
                    group: original?.group || (heroSetting ? 'hero-media' : 'general')
                }
            })

            await api.put('/settings/batch', { settings: settingsToUpdate })
            toast({
                title: "Settings Saved",
                description: "All configuration changes have been updated.",
            })
            mutate()
        } catch (err: unknown) {
            const apiError = err as Error & { response?: { data?: { message?: string } } }
            toast({
                variant: "destructive",
                title: "Error",
                description: apiError.response?.data?.message || apiError.message || 'Failed to save settings',
            })
        } finally {
            setIsSavingAll(false)
        }
    }

    const groupIcons: Record<string, React.ElementType> = {
        general: Globe,
        branding: Palette,
        security: ShieldCheck,
        contact: Mail,
        about: ShieldCheck,
        homepage: Globe,
        widgets: Palette,
        maintenance: ShieldCheck
    }

    const renderSetting = (setting: SiteSetting) => (
        <div key={setting.id} className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor={setting.key} className="text-sm font-semibold text-foreground/80">
                    {setting.key.split('_').join(' ').toUpperCase()}
                </Label>
                <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                    {setting.type}
                </span>
            </div>
            <div>
                {setting.type === 'image' || setting.type === 'file' || setting.key.includes('logo') || setting.key.includes('favicon') || setting.key.includes('image') ? (
                    <ImageUploader 
                        value={getMediaUrl(localSettings[setting.key] ?? setting.value ?? '')}
                        onChange={(url) => setLocalSettings((prev) => ({ ...prev, [setting.key]: url }))}
                        accept={setting.type === 'file' ? ['.pdf'] : undefined}
                        className="w-full"
                        label=""
                    />
                ) : setting.type === 'textarea' ? (
                    <Textarea 
                        id={setting.key}
                        value={localSettings[setting.key] ?? setting.value ?? ''}
                        onChange={(e) => setLocalSettings((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                        className="bg-background/50 min-h-[100px]"
                    />
                ) : setting.type === 'boolean' || setting.type === 'switch' ? (
                    <div className="flex items-center gap-2 pt-2">
                        <Switch 
                            id={setting.key}
                            checked={localSettings[setting.key] === '1' || localSettings[setting.key] === 'true'}
                            onCheckedChange={(checked: boolean) => setLocalSettings((prev) => ({ ...prev, [setting.key]: checked ? '1' : '0' }))}
                        />
                        <span className="text-xs text-muted-foreground">
                            {localSettings[setting.key] === '1' || localSettings[setting.key] === 'true' ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                ) : (
                    <Input 
                        id={setting.key}
                        value={localSettings[setting.key] ?? setting.value ?? ''}
                        onChange={(e) => setLocalSettings((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                        className="bg-background/50"
                    />
                )}
            </div>
        </div>
    )

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Site Settings</h1>
                        <p className="text-muted-foreground text-sm">Configure global variables, branding, and launch modes.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            className="bg-transparent border-border hover:bg-secondary text-foreground" 
                            onClick={() => mutate()} 
                            disabled={isLoading}
                        >
                            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                        </Button>
                        <Button 
                            onClick={handleSaveAll}
                            disabled={isSavingAll || isLoading}
                            className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                        >
                            {isSavingAll ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                            Save All Changes
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="bg-secondary/10 border border-border p-1 mb-8 overflow-x-auto justify-start h-auto">
                        <TabsTrigger value="general" className="gap-2 px-6 py-2 content-center text-foreground"><Globe size={14} /> General</TabsTrigger>
                        <TabsTrigger value="branding" className="gap-2 px-6 py-2 text-foreground"><Palette size={14} /> Branding</TabsTrigger>
                        <TabsTrigger value="maintenance" className="gap-2 px-6 py-2 text-foreground"><ShieldCheck size={14} /> Maintenance</TabsTrigger>
                        <TabsTrigger value="hero-media" className="gap-2 px-6 py-2 text-foreground"><Layout size={14} /> Page Hero Media</TabsTrigger>
                        <TabsTrigger value="navigation" className="gap-2 px-6 py-2 text-foreground"><ListOrdered size={14} /> Navigation</TabsTrigger>
                    </TabsList>

                    {isLoading ? (
                        <div className="py-12 flex justify-center items-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            <TabsContent value="general" className="space-y-8 focus-visible:outline-none focus-visible:ring-0">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {['general'].map(group => {
                                        const settings = settingsByGroup?.[group] || []
                                        if (settings.length === 0) return null
                                        const Icon = groupIcons[group] || Globe
                                        return (
                                            <Card key={group} className="bg-secondary/5 border-border shadow-sm">
                                                <CardHeader className="bg-secondary/10 border-b border-border pb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                            <Icon size={18} />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-foreground capitalize text-lg">Global Settings</CardTitle>
                                                            <CardDescription className="text-muted-foreground text-xs">Manage site-wide variables and metadata.</CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-6 space-y-6">
                                                    {settings.map(renderSetting)}
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </TabsContent>

                            <TabsContent value="branding" className="focus-visible:outline-none focus-visible:ring-0">
                                <Card className="bg-secondary/5 border-border max-w-4xl">
                                    <CardHeader className="bg-secondary/10 border-b border-border">
                                        <CardTitle className="text-foreground">Brand Assets</CardTitle>
                                        <CardDescription className="text-muted-foreground">Manage your logos and favicons across the site.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {settingsByGroup?.['branding']?.map(renderSetting)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="maintenance" className="focus-visible:outline-none focus-visible:ring-0">
                                <Card className="bg-secondary/5 border-border max-w-4xl">
                                    <CardHeader className="bg-secondary/10 border-border border-b">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-foreground">Maintenance Configuration</CardTitle>
                                                <CardDescription className="text-muted-foreground">Toggle maintenance mode and customize the public notification layout.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-8">
                                        {/* Dynamic Status Visual Banner */}
                                        <div className="pt-2">
                                            {(localSettings['maintenance_active'] === '1' || localSettings['maintenance_active'] === 'true') ? (
                                                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-start gap-3">
                                                    <ShieldCheck className="text-orange-500 shrink-0 h-5 w-5 mt-0.5 animate-pulse" />
                                                    <div className="text-sm">
                                                        <span className="font-bold text-orange-500 block">Scheduled Maintenance is ACTIVE</span>
                                                        <span className="text-muted-foreground text-xs leading-relaxed">
                                                            All public-facing routes are currently blocked and displaying the Maintenance Screen. 
                                                            The admin dashboard remains fully accessible.
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3">
                                                    <ShieldCheck className="text-emerald-500 shrink-0 h-5 w-5 mt-0.5" />
                                                    <div className="text-sm">
                                                        <span className="font-bold text-emerald-500 block">Website is LIVE & OPERATIONAL</span>
                                                        <span className="text-muted-foreground text-xs leading-relaxed">
                                                            All site services and pages are fully accessible to public visitors.
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-8 pt-4 border-t border-border/40">
                                            {settingsByGroup?.['maintenance']?.map(renderSetting)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="hero-media" className="focus-visible:outline-none focus-visible:ring-0">
                                <Card className="bg-secondary/5 border-border">
                                    <CardHeader className="bg-secondary/10 border-b border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                <Layout size={20} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-foreground">Page Hero Media</CardTitle>
                                                <CardDescription className="text-muted-foreground">Customize hero images and videos for all main pages.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {heroSettingsList.map((hero) => (
                                                <div key={hero.key} className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">{hero.label}</Label>
                                                        {hero.type === 'video' ? (
                                                            <Film size={14} className="text-muted-foreground/30" />
                                                        ) : (
                                                            <ImageIcon size={14} className="text-muted-foreground/30" />
                                                        )}
                                                    </div>
                                                    <ImageUploader 
                                                        value={localSettings[hero.key] || ''}
                                                        onChange={(url) => setLocalSettings(prev => ({ ...prev, [hero.key]: url }))}
                                                        accept={getHeroAccept(hero.type)}
                                                        label=""
                                                        className="w-full"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="navigation" className="focus-visible:outline-none focus-visible:ring-0">
                                <Card className="bg-secondary/5 border-border max-w-5xl">
                                    <CardHeader className="bg-secondary/10 border-b border-border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                    <ListOrdered size={20} />
                                                </div>
                                            <div>
                                                <CardTitle className="text-foreground">Website Menu Management</CardTitle>
                                                <CardDescription className="text-muted-foreground">Select pages or enter custom paths to reorder the main menu.</CardDescription>
                                            </div>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-9 px-4 text-xs font-bold gap-2 bg-background border-border text-foreground hover:bg-secondary"
                                                onClick={() => setNavLinks([...navLinks, { name: 'New Link', href: '/' }])}
                                            >
                                                <Plus size={14} /> Add New Link
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Reorder.Group axis="y" values={navLinks} onReorder={setNavLinks} className="space-y-4">
                                            {navLinks.map((link, index) => (
                                                <Reorder.Item 
                                                    key={link.name + index} 
                                                    value={link}
                                                    className="flex items-center gap-6 bg-secondary/10 border border-border p-4 rounded-xl cursor-grab active:cursor-grabbing group transition-all hover:border-primary/30"
                                                >
                                                    <div className="text-muted-foreground/30 group-hover:text-primary transition-colors">
                                                        <GripVertical size={20} />
                                                    </div>
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Menu Label</Label>
                                                            <Input 
                                                                value={link.name} 
                                                                onChange={(e) => {
                                                                    const newLinks = [...navLinks]
                                                                    newLinks[index].name = e.target.value
                                                                    setNavLinks(newLinks)
                                                                }}
                                                                className="h-10 bg-background border-border text-foreground"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Link Destination</Label>
                                                            <div className="flex gap-2">
                                                                <Select
                                                                    value={['/', '/services', '/insights', '/case-studies', '/about', '/contact'].includes(link.href) ? link.href : 'custom'}
                                                                    onValueChange={(val) => {
                                                                        const newLinks = [...navLinks]
                                                                        if (val !== 'custom') {
                                                                            newLinks[index].href = val
                                                                        }
                                                                        setNavLinks(newLinks)
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="h-10 bg-background border-border text-foreground flex-1">
                                                                        <SelectValue placeholder="Select Page" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-background border-border text-foreground">
                                                                        <SelectItem value="/">Home Page</SelectItem>
                                                                        <SelectItem value="/services">Services Page</SelectItem>
                                                                        <SelectItem value="/insights">Insights Page</SelectItem>
                                                                        <SelectItem value="/case-studies">Case Studies Page</SelectItem>
                                                                        <SelectItem value="/about">About Us Page</SelectItem>
                                                                        <SelectItem value="/contact">Contact Page</SelectItem>
                                                                        <SelectItem value="custom">Custom Path...</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                
                                                                {(!['/', '/services', '/insights', '/case-studies', '/about', '/contact'].includes(link.href)) && (
                                                                    <Input 
                                                                        value={link.href} 
                                                                        onChange={(e) => {
                                                                            const newLinks = [...navLinks]
                                                                            newLinks[index].href = e.target.value
                                                                            setNavLinks(newLinks)
                                                                        }}
                                                                        className="h-10 bg-background border-border text-foreground flex-1"
                                                                        placeholder="/custom-path"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 h-10 w-10"
                                                        onClick={() => setNavLinks(navLinks.filter((_, i) => i !== index))}
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </Reorder.Item>
                                            ))}
                                        </Reorder.Group>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        </AdminLayout>
    )
}

export default AdminSettingsPage
