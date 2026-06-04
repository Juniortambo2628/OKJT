"use client"

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Search, Save, Star, LayoutGrid, List, MoreVertical, ExternalLink } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'
import api from '@/lib/api'
import { CaseStudy } from '@/types/api'
import { useToast } from '@/hooks/use-toast'
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
import RichTextEditor from '@/components/admin/RichTextEditor'
import { useAutosave } from '@/hooks/use-autosave'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import AdminPageHeader from '@/components/admin/core/AdminPageHeader'
import AdminResourceToolbar from '@/components/admin/core/AdminResourceToolbar'
import { useAdminResource } from '@/hooks/use-admin-resource'

const AdminCaseStudiesPage = () => {
    const {
        filteredData: filteredCaseStudies,
        searchTerm, setSearchTerm,
        activeFilter, setActiveFilter,
        sortBy, setSortBy,
        sortOrder, setSortOrder,
        viewMode, setViewMode,
        selectedIds, setSelectedIds, toggleSelect, handleBulkDelete,
        showForm, setShowForm,
        form, setForm, resetForm,
        handleEdit, handleSave, handleDelete, 
        isSaving, isLoading, mutate, editingId
    } = useAdminResource<CaseStudy>({
        endpoint: '/case-studies',
        resourceName: 'Case Study',
        statusField: 'is_featured',
        initialForm: { 
            title: '', client_name: '', problem: '', methodology: '',
            outcome: '', significant_figure: '', image: '', is_featured: false 
        },
        filterFn: (cs: CaseStudy, s: string) => cs.title.toLowerCase().includes(s.toLowerCase()) || 
                             (cs.client_name || '').toLowerCase().includes(s.toLowerCase())
    })

    const { isSaving: isAutosaving, lastSaved, error: autosaveError } = useAutosave({
        data: form,
        enabled: showForm && !!form.title,
        endpoint: editingId ? `/case-studies/${editingId}` : undefined,
        localStorageKey: !editingId ? 'case_study_draft' : undefined,
        onSaveSuccess: () => {
            if (editingId) mutate()
        }
    })

    const handleCreate = () => {
        const draft = localStorage.getItem('case_study_draft')
        if (draft) {
            try {
                setForm(JSON.parse(draft))
            } catch (e) {
                resetForm()
            }
        } else {
            resetForm()
        }
        setShowForm(true)
    }

    const onSave = async () => {
        try {
            await handleSave()
            if (!editingId) localStorage.removeItem('case_study_draft')
        } catch (err) {
            // Error handled by hook
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <AdminPageHeader 
                    title="Case Studies" 
                    description="Showcase your advisory impact and project outcomes."
                    actionLabel="Add Case Study"
                    onAction={handleCreate}
                />

                <AdminResourceToolbar 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search case studies..."
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    activeLabel="Featured"
                    inactiveLabel="Standard"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={setSortBy}
                    onOrderChange={setSortOrder}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    selectedCount={selectedIds.length}
                    onBulkDelete={handleBulkDelete}
                />

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-secondary/20 animate-pulse border border-border/50 rounded-xl" />)}
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCaseStudies?.map((cs) => (
                                    <div key={cs.id} className="group relative bg-secondary/10 border border-border overflow-hidden hover:border-primary/40 transition-all flex flex-col shadow-sm">
                                        <div className="absolute top-3 left-3 z-10">
                                            <Checkbox 
                                                checked={selectedIds.includes(cs.id)}
                                                onCheckedChange={() => toggleSelect(cs.id)}
                                                className="border-border bg-background/50"
                                            />
                                        </div>
                                        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-background/80 border border-border/50"><MoreVertical size={16} /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(cs)} className="gap-2">
                                                        <Pencil size={14} /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2" asChild>
                                                        <a href={`/case-studies/${cs.slug}`} target="_blank"><ExternalLink size={14} /> View Live</a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(cs.id)} className="gap-2 text-destructive">
                                                        <Trash2 size={14} /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="aspect-video relative overflow-hidden bg-secondary/30">
                                            {cs.image ? (
                                                <img src={cs.image} alt={cs.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-primary/20">
                                                    <Star size={48} />
                                                </div>
                                            )}
                                            {cs.is_featured && (
                                                <div className="absolute top-4 right-4 z-10">
                                                    <Star size={20} className="fill-yellow-500 text-yellow-500 drop-shadow-lg" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">{cs.client_name}</span>
                                            </div>
                                            <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleEdit(cs)}>{cs.title}</h3>
                                            <div className="text-xs text-primary font-bold mb-4">{cs.significant_figure}</div>
                                            <div className="pt-4 border-t border-border flex items-center justify-end">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 hover:text-destructive bg-background/50 backdrop-blur-sm border border-border" onClick={() => handleDelete(cs.id)}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-secondary/10 border border-border/50 overflow-hidden rounded-lg">
                                <table className="w-full text-left">
                                    <thead className="bg-secondary/20 border-b border-border/50">
                                        <tr>
                                            <th className="p-4 px-6 w-10">
                                                <Checkbox 
                                                    checked={selectedIds.length === filteredCaseStudies?.length && filteredCaseStudies?.length > 0}
                                                    onCheckedChange={() => {
                                                        if (selectedIds.length === filteredCaseStudies?.length) setSelectedIds([])
                                                        else setSelectedIds(filteredCaseStudies?.map((i: CaseStudy) => i.id) || [])
                                                    }}
                                                />
                                            </th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Case Study</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Client</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Impact</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Featured</th>
                                            <th className="p-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredCaseStudies?.map((cs: CaseStudy) => (
                                            <tr key={cs.id} className="hover:bg-primary/5 transition-colors group">
                                                <td className="p-4 px-6">
                                                    <Checkbox 
                                                        checked={selectedIds.includes(cs.id)}
                                                        onCheckedChange={() => toggleSelect(cs.id)}
                                                        className="border-border"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded bg-secondary overflow-hidden shrink-0 border border-border/50">
                                                            {cs.image ? <img src={cs.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-primary/40"><Star size={16} /></div>}
                                                        </div>
                                                        <div className="font-bold line-clamp-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleEdit(cs)}>{cs.title}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs font-medium text-muted-foreground">{cs.client_name}</td>
                                                <td className="p-4 text-xs font-bold text-primary">{cs.significant_figure || '—'}</td>
                                                <td className="p-4">
                                                    {cs.is_featured ? <Star size={14} className="fill-yellow-500 text-yellow-500" /> : <span className="text-muted-foreground">—</span>}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cs)} className="h-8 w-8 p-0"><Pencil size={14} /></Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(cs.id)} className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"><Trash2 size={14} /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {filteredCaseStudies?.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-xl opacity-50">
                                <p className="text-muted-foreground">No case studies found matching your criteria.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Form Modal */}
            <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit' : 'New'} Case Study</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Title</Label>
                                <Input className="bg-background border-border text-foreground" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Client Name</Label>
                                <Input className="bg-background border-border text-foreground" value={form.client_name || ''} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Category</Label>
                                <Input className="bg-background border-border text-foreground" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Health & Medical" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Website URL</Label>
                                <Input className="bg-background border-border text-foreground" value={form.website_url || ''} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="e.g. https://project-link.com" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-muted-foreground">Short Description</Label>
                                <Input className="bg-background border-border text-foreground" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A brief summary for the project." />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Technologies (comma separated)</Label>
                            <Input 
                                className="bg-background border-border text-foreground" 
                                value={Array.isArray(form.technologies) ? form.technologies.join(', ') : (form.technologies || '')} 
                                onChange={(e) => setForm({ ...form, technologies: e.target.value.split(',').map(t => t.trim()) })} 
                                placeholder="e.g. React, Laravel, PostgreSQL" 
                            />
                        </div>
                        
                        <RichTextEditor 
                            label="The Problem"
                            value={form.problem || ''}
                            onChange={(val) => setForm({ ...form, problem: val })}
                            className="min-h-[120px]"
                        />

                        <RichTextEditor 
                            label="Methodology & Approach"
                            value={form.methodology || ''}
                            onChange={(val) => setForm({ ...form, methodology: val })}
                            className="min-h-[120px]"
                        />

                        <RichTextEditor 
                            label="Outcome & Results"
                            value={form.outcome || ''}
                            onChange={(val) => setForm({ ...form, outcome: val })}
                            className="min-h-[120px]"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-border/50 rounded-lg bg-secondary/5">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-bold">Testimonial Author</Label>
                                <Input className="bg-background border-border text-foreground" value={form.testimonial_author || ''} onChange={(e) => setForm({ ...form, testimonial_author: e.target.value })} placeholder="e.g. Dr. Sarah Nyawira" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-muted-foreground font-bold">Testimonial Quote</Label>
                                <RichTextEditor 
                                    value={form.testimonial_quote || ''}
                                    onChange={(val) => setForm({ ...form, testimonial_quote: val })}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <ImageUploader
                                label="Featured Image"
                                value={form.image || ''}
                                onChange={(url) => setForm({ ...form, image: url })}
                            />

                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-bold">Gallery Images (comma separated URLs)</Label>
                                <Input 
                                    className="bg-background border-border text-foreground" 
                                    value={Array.isArray(form.gallery) ? form.gallery.join(', ') : (form.gallery || '')} 
                                    onChange={(e) => setForm({ ...form, gallery: e.target.value.split(',').map(t => t.trim()) })} 
                                    placeholder="Enter image URLs separated by comma" 
                                />
                                <div className="text-[10px] text-muted-foreground/50">Note: You can use Cloudinary URLs or local paths.</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Checkbox 
                                id="is_featured_modal" 
                                checked={form.is_featured} 
                                onCheckedChange={(checked) => setForm({ ...form, is_featured: !!checked })} 
                                className="border-border"
                            />
                            <Label htmlFor="is_featured_modal" className="text-muted-foreground">Featured Case Study</Label>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto">
                            {isAutosaving ? (
                                <><Loader2 className="animate-spin text-primary" size={12} /> Saving draft...</>
                            ) : lastSaved ? (
                                <><CheckCircle2 className="text-emerald-500" size={12} /> Saved to cloud at {lastSaved.toLocaleTimeString()}</>
                            ) : autosaveError ? (
                                <><AlertCircle className="text-destructive" size={12} /> {autosaveError}</>
                            ) : editingId ? (
                                <span className="opacity-50">Cloud autosave active</span>
                            ) : (
                                <span className="opacity-50">Local draft storage active</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={resetForm} disabled={isSaving}>Cancel</Button>
                            <Button onClick={onSave} disabled={isSaving} className="gap-2 bg-primary hover:bg-primary/90 text-[#14110b] font-bold">
                                {isSaving ? 'Saving...' : (editingId ? 'Update Case Study' : 'Create Case Study')}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}

export default AdminCaseStudiesPage
