"use client"

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, MoreVertical, ExternalLink, Globe, Rocket, Shield, Zap, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUploader from '@/components/admin/ImageUploader'
import { cn, getMediaUrl } from '@/lib/utils'
import { Innovation } from '@/types/api'
import AdminPageHeader from '@/components/admin/core/AdminPageHeader'
import AdminSearchBox from '@/components/admin/core/AdminSearchBox'
import { useAdminResource } from '@/hooks/use-admin-resource'

const AdminInnovationsPage = () => {
    const {
        filteredData: filteredInnovations,
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
    } = useAdminResource<Innovation>({
        endpoint: '/innovations',
        resourceName: 'Innovation',
        initialForm: {
            title: '',
            tagline: '',
            description: '',
            image: '',
            url: '',
            is_active: true,
            is_featured: false,
            order: 0,
        },
        filterFn: (p, term) => p.title.toLowerCase().includes(term.toLowerCase())
    })

    const onSave = async () => {
        if (!form.title) return;
        await handleSave();
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <AdminPageHeader 
                    title="Flagship Innovations"
                    description="Manage your bespoke flagship projects like Naoa, Najenga, and Tibu."
                    actionLabel="Add Innovation"
                    onAction={() => { resetForm(); setShowForm(true); }}
                />

                <AdminSearchBox 
                    placeholder="Search innovations..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                />

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-secondary/20 animate-pulse border border-border/50" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInnovations?.map((item) => {
                            return (
                                <div key={item.id} className="group relative bg-secondary/10 border border-border overflow-hidden hover:border-primary/40 transition-all flex flex-col shadow-sm">
                                    <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 bg-background/50 backdrop-blur-sm border border-border">
                                                    <MoreVertical size={14} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(item)} className="gap-2">
                                                    <Pencil size={14} /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(item.id)} className="gap-2 text-destructive">
                                                    <Trash2 size={14} /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {item.image ? (
                                        <div className="aspect-video relative overflow-hidden bg-secondary/30">
                                            <img src={getMediaUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-primary/5 flex items-center justify-center text-primary/20">
                                            <Rocket size={48} />
                                        </div>
                                    )}

                                    <div className="p-6 space-y-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {!item.is_active && <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5">Draft</span>}
                                                {item.is_featured && <Star size={14} className="fill-yellow-500 text-yellow-500" />}
                                            </div>
                                            <span className="text-[10px] font-mono text-muted-foreground">Order: {item.order}</span>
                                        </div>
                                        <h3 className="font-bold text-xl leading-tight text-foreground">{item.title}</h3>
                                        {item.tagline && <p className="text-xs font-bold text-primary uppercase tracking-wider">{item.tagline}</p>}
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="px-6 pb-6 pt-0 flex items-center justify-between">
                                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-muted-foreground hover:text-foreground" onClick={() => handleEdit(item)}>Edit Project</Button>
                                        {item.url && (
                                            <a href={item.url} target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
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
                        <DialogTitle>{editingId ? 'Edit' : 'New'} Flagship Innovation</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                            {editingId ? 'Update the details of this flagship project.' : 'Add a new flagship project to showcase your innovations.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Title</label>
                            <Input className="bg-background border-border text-foreground" placeholder="e.g. Naoa" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Tagline</label>
                            <Input className="bg-background border-border text-foreground" placeholder="Short catchphrase" value={form.tagline || ''} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Category / Sector</label>
                            <Input className="bg-background border-border text-foreground" placeholder="e.g. Fintech, Healthcare" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Impact Result (e.g. 98% Growth)</label>
                            <Input className="bg-background border-border text-foreground" placeholder="Key metric highlight" value={form.significant_figure || ''} onChange={(e) => setForm({ ...form, significant_figure: e.target.value })} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Technologies (Comma separated)</label>
                            <Input 
                                className="bg-background border-border text-foreground" 
                                placeholder="React, Laravel, PostgreSQL..." 
                                value={Array.isArray(form.technologies) ? form.technologies.join(', ') : form.technologies || ''} 
                                onChange={(e) => setForm({ ...form, technologies: e.target.value.split(',').map(t => t.trim()) })} 
                            />
                        </div>
                        
                        <div className="md:col-span-2 border-t border-border/50 pt-6 mt-4">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Project Narrative</h4>
                        </div>

                        <div className="md:col-span-2">
                            <RichTextEditor 
                                label="The Challenge (Problem Statement)"
                                value={form.problem || ''}
                                onChange={(problem) => setForm({ ...form, problem })}
                                className="min-h-[150px]"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <RichTextEditor 
                                label="Strategic Approach (Methodology)"
                                value={form.methodology || ''}
                                onChange={(methodology) => setForm({ ...form, methodology })}
                                className="min-h-[150px]"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <RichTextEditor 
                                label="Tangible Impact (Outcome)"
                                value={form.outcome || ''}
                                onChange={(outcome) => setForm({ ...form, outcome })}
                                className="min-h-[150px]"
                            />
                        </div>

                        <div className="md:col-span-2 border-t border-border/50 pt-6 mt-4">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Testimonials & Social Proof</h4>
                        </div>

                        <div className="md:col-span-2">
                            <RichTextEditor 
                                label="Client Testimonial Quote"
                                value={form.testimonial_quote || ''}
                                onChange={(testimonial_quote) => setForm({ ...form, testimonial_quote })}
                                className="min-h-[120px]"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Testimonial Author</label>
                            <Input className="bg-background border-border text-foreground" placeholder="Name, Role" value={form.testimonial_author || ''} onChange={(e) => setForm({ ...form, testimonial_author: e.target.value })} />
                        </div>

                        <div className="md:col-span-2 border-t border-border/50 pt-6 mt-4">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Media Assets</h4>
                        </div>

                        <div className="md:col-span-2">
                            <ImageUploader
                                label="Main Hero Image"
                                value={form.image || ''}
                                onChange={(url) => setForm({ ...form, image: url })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">Project Gallery (One URL per line)</label>
                            <textarea 
                                className="w-full h-32 bg-background border border-border text-foreground p-3 rounded-md focus:ring-1 focus:ring-primary outline-none"
                                placeholder="/assets/images/gallery1.png&#10;/assets/images/gallery2.png"
                                value={Array.isArray(form.gallery) ? form.gallery.join('\n') : form.gallery || ''}
                                onChange={(e) => setForm({ ...form, gallery: e.target.value.split('\n').filter(l => l.trim().length > 0) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Live Product URL</label>
                            <Input className="bg-background border-border text-foreground" placeholder="https://..." value={form.url || ''} onChange={(e) => setForm({ ...form, url: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Display Order</label>
                            <Input type="number" className="bg-background border-border text-foreground" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                        </div>

                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    checked={form.is_active} 
                                    onCheckedChange={(checked: boolean) => setForm({ ...form, is_active: !!checked })} 
                                    id="is_active_inn"
                                    className="border-border"
                                />
                                <label htmlFor="is_active_inn" className="text-sm font-medium text-muted-foreground">Publicly Active</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    checked={form.is_featured} 
                                    onCheckedChange={(checked: boolean) => setForm({ ...form, is_featured: !!checked })} 
                                    id="is_featured_inn"
                                    className="border-border"
                                />
                                <label htmlFor="is_featured_inn" className="text-sm font-medium text-muted-foreground">Featured Project</label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm} disabled={isSaving}>Cancel</Button>
                        <Button onClick={() => handleSave()} disabled={isSaving} className="gap-2 bg-primary hover:bg-primary/90 text-[#14110b] font-bold">
                            {isSaving ? 'Saving...' : 'Save Innovation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}

export default AdminInnovationsPage
