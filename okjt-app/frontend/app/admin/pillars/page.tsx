"use client"

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, MoreVertical, ExternalLink, Activity, Shield, Zap, TrendingUp, BarChart, Globe, Mail, Users, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Pillar } from '@/types/api'
import { Checkbox } from '@/components/ui/checkbox'
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ImageUploader from '@/components/admin/ImageUploader'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { cn } from '@/lib/utils'
import AdminPageHeader from '@/components/admin/core/AdminPageHeader'
import AdminSearchBox from '@/components/admin/core/AdminSearchBox'
import { useAdminResource } from '@/hooks/use-admin-resource'

const iconMap: Record<string, React.ElementType> = {
    Activity, Shield, Zap, TrendingUp, BarChart, Globe, Mail, Users, Settings
}

const AdminPillarsPage = () => {
    const {
        filteredData: filteredPillars,
        isLoading,
        searchTerm,
        setSearchTerm,
        showForm,
        setShowForm,
        editingId,
        isSaving,
        form,
        setForm,
        resetForm,
        handleEdit,
        handleSave,
        handleDelete,
    } = useAdminResource<Pillar>({
        endpoint: '/pillars',
        resourceName: 'Pillar',
        initialForm: {
            title: '',
            overview: '',
            content: '',
            icon: 'Activity',
            image: '',
            is_active: true,
        },
        filterFn: (p, term) => p.title.toLowerCase().includes(term.toLowerCase())
    })

    const onSave = async () => {
        if (!form.title) {
            return // Hook handles validation toast or I can keep it local for specific checks
        }
        await handleSave()
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <AdminPageHeader 
                    title="Brand Core Pillars"
                    description="Manage the foundational pillars and core values that drive your engineering approach."
                    actionLabel="Add Pillar"
                    onAction={() => { resetForm(); setShowForm(true); }}
                />

                <AdminSearchBox 
                    placeholder="Search pillars..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                />

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-secondary/20 animate-pulse border border-border/50" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPillars?.map((pillar) => {
                            const IconNode = iconMap[pillar.icon || 'Activity'] || Activity
                            return (
                                <div key={pillar.id} className="group relative bg-secondary/10 border border-border p-6 overflow-hidden hover:border-primary/40 transition-all flex flex-col shadow-sm">
                                    <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 bg-background/50 backdrop-blur-sm border border-border">
                                                    <MoreVertical size={14} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(pillar)} className="gap-2">
                                                    <Pencil size={14} /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(pillar.id)} className="gap-2 text-destructive">
                                                    <Trash2 size={14} /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="mb-6 w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-xl ring-1 ring-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <IconNode size={32} />
                                    </div>

                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-2">
                                            {!pillar.is_active && <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5">Inactive</span>}
                                        </div>
                                        <h3 className="font-bold text-xl leading-tight text-foreground">{pillar.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {pillar.overview}
                                        </p>
                                        <div className="pt-2 text-[10px] uppercase tracking-widest font-bold text-primary/60">
                                            {pillar.services?.length || 0} Associated Services
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-muted-foreground hover:text-foreground" onClick={() => handleEdit(pillar)}>Manage Pillar</Button>
                                        <a href={`/our-approach/${pillar.slug}`} target="_blank" className="text-muted-foreground hover:text-primary transition-colors"><ExternalLink size={16} /></a>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Form Modal */}
            <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit' : 'New'} Pillar</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Title</label>
                            <Input className="bg-background border-border text-foreground" placeholder="Pillar Title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Short Overview</label>
                            <Input className="bg-background border-border text-foreground" placeholder="Brief overview of the pillar" value={form.overview || ''} onChange={(e) => setForm({ ...form, overview: e.target.value })} />
                        </div>
                        
                        <div className="md:col-span-2">
                            <RichTextEditor 
                                label="Detailed Content"
                                value={form.content || ''}
                                onChange={(content) => setForm({ ...form, content })}
                                className="min-h-[200px]"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Overview Background Image
                            </label>
                            <ImageUploader
                                value={form.image || ''}
                                onChange={(image) => setForm({ ...form, image })}
                                accept={['.jpg', '.jpeg', '.png', '.webp']}
                                label=""
                                className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">
                                Used behind this pillar on the Our Approach scrolling overview page.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium block text-muted-foreground">Icon Selection</label>
                            <div className="grid grid-cols-5 gap-2">
                                {Object.keys(iconMap).map(iconName => (
                                    <Button 
                                        key={iconName}
                                        type="button"
                                        variant={form.icon === iconName ? 'secondary' : 'ghost'}
                                        className={cn("h-10 w-10 p-0", form.icon === iconName && "ring-1 ring-primary")}
                                        onClick={() => setForm({ ...form, icon: iconName })}
                                    >
                                        {React.createElement(iconMap[iconName] as React.ElementType, { size: 18 })}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-8">
                            <Checkbox 
                                checked={form.is_active} 
                                onCheckedChange={(checked: boolean) => setForm({ ...form, is_active: !!checked })} 
                                id="is_active_pillar"
                                className="border-border"
                            />
                            <label htmlFor="is_active_pillar" className="text-sm font-medium text-muted-foreground">Active</label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm} disabled={isSaving}>Cancel</Button>
                        <Button onClick={() => handleSave()} disabled={isSaving} className="gap-2">
                            {isSaving ? 'Saving...' : 'Save Pillar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}

export default AdminPillarsPage
