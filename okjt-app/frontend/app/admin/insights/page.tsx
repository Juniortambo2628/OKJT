"use client"

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Search, Calendar, User, ImageIcon, LayoutGrid, List, MoreVertical, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import ImageUploader from '@/components/admin/ImageUploader'
import api from '@/lib/api'
import { Insight } from '@/types/api'
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
import { cn } from '@/lib/utils'
import { useAutosave } from '@/hooks/use-autosave'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import AdminPageHeader from '@/components/admin/core/AdminPageHeader'
import AdminResourceToolbar from '@/components/admin/core/AdminResourceToolbar'
import { useAdminResource } from '@/hooks/use-admin-resource'

const AdminInsightsPage = () => {
    const {
        filteredData: filteredInsights,
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
    } = useAdminResource<Insight>({
        endpoint: '/insights',
        resourceName: 'Insight',
        statusField: 'is_published',
        initialForm: { title: '', category: '', excerpt: '', content: '', image: '', is_published: true },
        filterFn: (i: Insight, s: string) => i.title.toLowerCase().includes(s.toLowerCase()) || (i.category || '').toLowerCase().includes(s.toLowerCase())
    })

    const { isSaving: isAutosaving, lastSaved, error: autosaveError } = useAutosave({
        data: form,
        enabled: showForm && !!form.title, // Only autosave if form is open and has a title
        endpoint: editingId ? `/insights/${editingId}` : undefined,
        localStorageKey: !editingId ? 'insight_draft' : undefined,
        onSaveSuccess: () => {
            if (editingId) mutate()
        }
    })

    const handleCreate = () => {
        const draft = localStorage.getItem('insight_draft')
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
            if (!editingId) localStorage.removeItem('insight_draft')
        } catch (err) {
            // Error handled by hook
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <AdminPageHeader 
                    title="Market Insights" 
                    description="Manage your energy intelligence and articles."
                    actionLabel="Create Insight"
                    onAction={handleCreate}
                />

                <AdminResourceToolbar 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search insights..."
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    activeLabel="Published"
                    inactiveLabel="Draft"
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
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-secondary/20 animate-pulse border border-border/50 rounded-lg" />)}
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredInsights?.map((insight) => (
                                    <div key={insight.id} className="group relative bg-secondary/10 border border-border overflow-hidden hover:border-primary/40 transition-all flex flex-col shadow-sm">
                                        <div className="absolute top-3 left-3 z-10">
                                            <Checkbox 
                                                checked={selectedIds.includes(insight.id)}
                                                onCheckedChange={() => toggleSelect(insight.id)}
                                                className="border-border bg-background/50"
                                            />
                                        </div>
                                        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-background/80 border border-border/50"><MoreVertical size={16} /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(insight)} className="gap-2">
                                                        <Pencil size={14} /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2" asChild>
                                                        <a href={`/insights/${insight.slug}`} target="_blank"><ExternalLink size={14} /> View Live</a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(insight.id)} className="gap-2 text-destructive">
                                                        <Trash2 size={14} /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="aspect-video relative overflow-hidden bg-secondary/30">
                                            {insight.image ? (
                                                <img src={insight.image} alt={insight.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-primary/20">
                                                    <ImageIcon size={48} />
                                                </div>
                                            )}
                                            {!insight.is_published && (
                                                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-500 px-3 py-1 border border-amber-500/30">Draft</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">{insight.category || 'General'}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{new Date(insight.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleEdit(insight)}>{insight.title}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                                                {insight.excerpt?.replace(/<[^>]*>?/gm, '')}
                                            </p>
                                            <div className="pt-4 border-t border-border flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <User size={12} className="text-primary/60" /> {insight.user?.name || 'Admin'}
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 hover:text-destructive bg-background/50 backdrop-blur-sm border border-border" onClick={() => handleDelete(insight.id)}>
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
                                                    checked={selectedIds.length === filteredInsights?.length && filteredInsights?.length > 0}
                                                    onCheckedChange={() => {
                                                        if (selectedIds.length === filteredInsights?.length) setSelectedIds([])
                                                        else setSelectedIds(filteredInsights?.map((i: Insight) => i.id) || [])
                                                    }}
                                                />
                                            </th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Title</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Category</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Date</th>
                                            <th className="p-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredInsights?.map((insight: Insight) => (
                                            <tr key={insight.id} className="hover:bg-primary/5 transition-colors group">
                                                <td className="p-4 px-6">
                                                    <Checkbox 
                                                        checked={selectedIds.includes(insight.id)}
                                                        onCheckedChange={() => toggleSelect(insight.id)}
                                                        className="border-border"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded bg-secondary overflow-hidden shrink-0 border border-border/50">
                                                            {insight.image ? <img src={insight.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-primary/40"><ImageIcon size={16} /></div>}
                                                        </div>
                                                        <div className="font-bold line-clamp-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleEdit(insight)}>{insight.title}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-xs font-medium text-muted-foreground">{insight.category || '—'}</span>
                                                </td>
                                                <td className="p-4">
                                                    {insight.is_published ? (
                                                        <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Draft</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-xs text-muted-foreground">
                                                    {new Date(insight.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(insight)} className="h-8 w-8 p-0"><Pencil size={14} /></Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(insight.id)} className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"><Trash2 size={14} /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {filteredInsights?.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-xl opacity-50">
                                <p className="text-muted-foreground">No insights found matching your criteria.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Form Modal */}
            <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit' : 'New'} Insight</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Title</label>
                            <Input className="bg-background border-border text-foreground" placeholder="Insight Title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Category</label>
                            <Input className="bg-background border-border text-foreground" placeholder="Category" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                        </div>
                        
                        <div className="md:col-span-2">
                            <RichTextEditor 
                                label="Excerpt"
                                value={form.excerpt || ''}
                                onChange={(excerpt) => setForm({ ...form, excerpt })}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <RichTextEditor 
                                label="Full Content"
                                value={form.content || ''}
                                onChange={(content) => setForm({ ...form, content })}
                                className="min-h-[300px]"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <ImageUploader 
                                label="Featured Image"
                                value={form.image || ''}
                                onChange={(url) => setForm({ ...form, image: url })}
                                maxSizeMB={10}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox 
                                checked={form.is_published} 
                                onCheckedChange={(checked: boolean) => setForm({ ...form, is_published: !!checked })} 
                                id="is_published_modal"
                                className="border-border"
                            />
                            <label htmlFor="is_published_modal" className="text-sm font-medium text-muted-foreground">Published</label>
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
                                {isSaving ? 'Saving...' : 'Save Insight'}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}

export default AdminInsightsPage

