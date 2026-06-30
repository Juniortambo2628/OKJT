"use client"

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Globe, Palette, ShieldCheck, Mail, GripVertical, Plus, Trash2, Layout, Film, Image as ImageIcon, ListOrdered, RefreshCw } from 'lucide-react'
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
import ImageUploader from '@/components/admin/ImageUploader'
import { SiteSetting } from '@/types/api'
import { useToast } from '@/hooks/use-toast'
import { Reorder } from 'framer-motion'
import { getMediaUrl } from '@/lib/utils'
import SettingsHeader from '@/components/admin/core/SettingsHeader'

const AdminSettingsPage = () => {
    const { settingsByGroup, localSettings, updateSetting, handleSave, isLoading, isSaving, mutate } = useSiteSettings()
    const { toast } = useToast()
    const [navLinks, setNavLinks] = useState<{name: string, href: string}[]>([])

    // Sync nav links when data loads
    React.useEffect(() => {
        if (settingsByGroup) {
            Object.values(settingsByGroup).flat().forEach((s) => {
                if (s.key === 'main_nav_links') {
                    try {
                        setNavLinks(JSON.parse(s.value || '[]'))
                    } catch (e) {
                        console.error("Failed to parse local nav links", e)
                    }
                }
            })
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
        { key: 'hero_projects_media', label: 'Projects Hero', type: 'media' },
        { key: 'hero_client_impact_media', label: 'Client Impact Hero', type: 'media' },
        { key: 'hero_contact_media', label: 'Contact Page Hero', type: 'media' },
        { key: 'hero_consultation_media', label: 'Consultation Hero', type: 'media' },
        { key: 'stats_background', label: 'Stats Section Background', type: 'media' },
        { key: 'hero_pillar_web_development', label: 'Pillar: Web Development Hero', type: 'media' },
        { key: 'hero_pillar_ui_ux_design', label: 'Pillar: UI/UX Design Hero', type: 'media' },
        { key: 'hero_pillar_digital_strategy', label: 'Pillar: Digital Strategy Hero', type: 'media' },
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
        await handleSave((settings, local) => {
            const updated = { ...local }
            updated.main_nav_links = JSON.stringify(navLinks)
            return updated
        })
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
                        onChange={(url) => updateSetting(setting.key, url)}
                        accept={setting.type === 'file' ? ['.pdf'] : undefined}
                        className="w-full"
                        label=""
                    />
                ) : setting.type === 'textarea' ? (
                    <Textarea 
                        id={setting.key}
                        value={localSettings[setting.key] ?? setting.value ?? ''}
                        onChange={(e) => updateSetting(setting.key, e.target.value)}
                        className="bg-background/50 min-h-[100px]"
                    />
                ) : setting.type === 'boolean' || setting.type === 'switch' ? (
                    <div className="flex items-center gap-2 pt-2">
                        <Switch 
                            id={setting.key}
                            checked={localSettings[setting.key] === '1' || localSettings[setting.key] === 'true'}
                            onCheckedChange={(checked: boolean) => updateSetting(setting.key, checked ? '1' : '0')}
                        />
                        <span className="text-xs text-muted-foreground">
                            {localSettings[setting.key] === '1' || localSettings[setting.key] === 'true' ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                ) : (
                    <Input 
                        id={setting.key}
                        value={localSettings[setting.key] ?? setting.value ?? ''}
                        onChange={(e) => updateSetting(setting.key, e.target.value)}
                        className="bg-background/50"
                    />
                )}
            </div>
        </div>
    )

    return (
        <AdminLayout>
            <div className="space-y-8">
                <SettingsHeader
                    title="Site Settings"
                    description="Configure global variables, branding, and launch modes."
                    onSave={handleSaveAll}
                    onRefresh={() => mutate()}
                    isSaving={isSaving}
                    isLoading={isLoading}
                    isRefreshing={isLoading}
                />

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="bg-secondary/10 border border-border p-1 mb-8 overflow-x-auto justify-start h-auto">
                        <TabsTrigger value="general" className="gap-2 px-6 py-2 content-center text-foreground"><Globe size={14} /> General</TabsTrigger>
                        <TabsTrigger value="branding" className="gap-2 px-6 py-2 text-foreground"><Palette size={14} /> Branding</TabsTrigger>
                        <TabsTrigger value="maintenance" className="gap-2 px-6 py-2 text-foreground"><ShieldCheck size={14} /> Maintenance</TabsTrigger>
                        <TabsTrigger value="hero-media" className="gap-2 px-6 py-2 text-foreground"><Layout size={14} /> Page Hero Media</TabsTrigger>
                        <TabsTrigger value="section-media" className="gap-2 px-6 py-2 text-foreground"><ImageIcon size={14} /> Section Backgrounds</TabsTrigger>
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
                                                        onChange={(url) => updateSetting(hero.key, url)}
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

                            <TabsContent value="section-media" className="focus-visible:outline-none focus-visible:ring-0">
                                <Card className="bg-secondary/5 border-border">
                                    <CardHeader className="bg-secondary/10 border-b border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                <Layout size={20} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-foreground">Section Background Media</CardTitle>
                                                <CardDescription className="text-muted-foreground">Customize background media for the scrollable sections across the site.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {[
                                                { key: 'bg_home_value_proposition', label: 'Home: Core Values Background' },
                                                { key: 'bg_home_stats', label: 'Home: Stats Background' },
                                                { key: 'bg_home_services', label: 'Home: Services Background' },
                                                { key: 'bg_home_insights', label: 'Home: Insights Background' },
                                                { key: 'bg_home_cta', label: 'Home: CTA Background' },
                                                { key: 'bg_about_mission', label: 'About: Mission Background' },
                                                { key: 'bg_about_values', label: 'About: Values Background' },
                                                { key: 'bg_about_team', label: 'About: Team Background' },
                                                { key: 'bg_about_cta', label: 'About: CTA Background' },
                                                { key: 'bg_services_web_development', label: 'Services: Web Dev Background' },
                                                { key: 'bg_services_ui_ux_design', label: 'Services: UI/UX Background' },
                                                { key: 'bg_services_digital_strategy', label: 'Services: Strategy Background' },
                                                { key: 'bg_client_impact_intro', label: 'Client Impact: Intro Background' },
                                                { key: 'bg_client_impact_testimonials', label: 'Client Impact: Testimonials Background' },
                                                { key: 'bg_client_impact_case_studies', label: 'Client Impact: Case Studies Background' },
                                                { key: 'bg_contact_form', label: 'Contact: Form Background' },
                                                { key: 'bg_contact_offices', label: 'Contact: Offices Background' },
                                                { key: 'bg_insights_featured', label: 'Insights: Featured Background' },
                                                { key: 'bg_insights_grid', label: 'Insights: Grid Background' },
                                                { key: 'bg_projects_featured', label: 'Projects: Featured Background' },
                                                { key: 'bg_projects_grid', label: 'Projects: Grid Background' },
                                            ].map((section) => (
                                                <div key={section.key} className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">{section.label}</Label>
                                                        <ImageIcon size={14} className="text-muted-foreground/30" />
                                                    </div>
                                                    <ImageUploader 
                                                        value={localSettings[section.key] || ''}
                                                        onChange={(url) => updateSetting(section.key, url)}
                                                        accept={['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm']}
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
                                                                    value={['/', '/services', '/insights', '/projects', '/about', '/contact'].includes(link.href) ? link.href : 'custom'}
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
                                                                        <SelectItem value="/projects">Projects Page</SelectItem>
                                                                        <SelectItem value="/about">About Us Page</SelectItem>
                                                                        <SelectItem value="/contact">Contact Page</SelectItem>
                                                                        <SelectItem value="custom">Custom Path...</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                
                                                                {(!['/', '/services', '/insights', '/projects', '/about', '/contact'].includes(link.href)) && (
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
