"use client"

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Search, LayoutGrid, List, MoreVertical, ExternalLink, Activity, Shield, Zap, TrendingUp, BarChart, Globe, Mail, Users, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Service, Pillar } from '@/types/api'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import RichTextEditor from '@/components/admin/RichTextEditor'
import { cn } from '@/lib/utils'
import AdminPageHeader from '@/components/admin/core/AdminPageHeader'
import AdminResourceToolbar from '@/components/admin/core/AdminResourceToolbar'
import { useAdminResource } from '@/hooks/use-admin-resource'

const iconMap: Record<string, React.ElementType> = {
    Activity, Shield, Zap, TrendingUp, BarChart, Globe, Mail, Users, Settings
}

const AdminServicesPage = () => {
    const { data: pillars } = useApi<Pillar[]>('/pillars')
    
    const {
        filteredData: filteredServices,
        isLoading,
        searchTerm,
        setSearchTerm,
        activeFilter,
        setActiveFilter,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        viewMode,
        setViewMode,
        selectedIds,
        toggleSelect,
        selectAll,
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
        handleBulkDelete,
    } = useAdminResource<Service>({
        endpoint: '/services',
        resourceName: 'Service',
        initialForm: {
            title: '',
            category: '',
            pillar_id: undefined,
            description: '',
            content: '',
            icon: 'Activity',
            is_active: true,
        },
        filterFn: (s, term) => 
            s.title.toLowerCase().includes(term.toLowerCase()) || 
            (s.category || '').toLowerCase().includes(term.toLowerCase())
    })

    const onSave = async () => {
        if (!form.title) return;
        await handleSave();
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <AdminPageHeader 
                    title="Advisory Services"
                    description="Manage your core advisory offerings and service categories."
                    actionLabel="Add Service"
                    onAction={() => { resetForm(); setShowForm(true); }}
                />

                <AdminResourceToolbar 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search services..."
                    
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    sortOrder={sortOrder}
                    onOrderChange={setSortOrder}
                    
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    
                    selectedCount={selectedIds.length}
                    onBulkDelete={handleBulkDelete}
                />

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-secondary/20 animate-pulse border border-border/50" />)}
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredServices?.map((service) => {
                                    const IconNode = iconMap[service.icon || 'Activity'] || Activity
                                    return (
                                        <div key={service.id} className="group relative bg-secondary/10 border border-border p-6 overflow-hidden hover:border-primary/40 transition-all flex flex-col shadow-sm">
                                            <div className="absolute top-4 left-4 z-10">
                                                <Checkbox 
                                                    checked={selectedIds.includes(service.id)}
                                                    onCheckedChange={() => toggleSelect(service.id)}
                                                    className="border-border bg-background/50"
                                                />
                                            </div>
                                            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 bg-background/50 backdrop-blur-sm border border-border">
                                                            <MoreVertical size={14} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(service)} className="gap-2">
                                                            <Pencil size={14} /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(service.id)} className="gap-2 text-destructive">
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
                                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">{service.category || 'Advisory'}</span>
                                                    {!service.is_active && <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5">Inactive</span>}
                                                </div>
                                                <h3 className="font-bold text-xl leading-tight text-foreground">{service.title}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {service.description}
                                                </p>
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                                                <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-muted-foreground hover:text-foreground" onClick={() => handleEdit(service)}>Update details</Button>
                                                <a href={`/services#${service.slug}`} target="_blank" className="text-muted-foreground hover:text-primary transition-colors"><ExternalLink size={16} /></a>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="bg-secondary/10 border border-border/50 overflow-hidden rounded-lg">
                                <table className="w-full text-left">
                                    <thead className="bg-secondary/20 border-b border-border/50">
                                        <tr>
                                            <th className="p-4 px-6 w-10">
                                                <Checkbox 
                                                    checked={selectedIds.length === filteredServices?.length && filteredServices?.length > 0}
                                                    onCheckedChange={() => selectAll(filteredServices?.map(i => i.id) || [])}
                                                />
                                            </th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Service</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Category</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                                            <th className="p-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredServices?.map((service) => {
                                            const IconNode = iconMap[service.icon || 'Activity'] || Activity
                                            return (
                                                <tr key={service.id} className="hover:bg-primary/5 transition-colors group">
                                                    <td className="p-4 px-6">
                                                    <Checkbox 
                                                            checked={selectedIds.includes(service.id)}
                                                            onCheckedChange={() => toggleSelect(service.id)}
                                                            className="border-border"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                                <IconNode size={17} />
                                                            </div>
                                                            <div className="font-bold text-sm">{service.title}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-xs font-medium text-muted-foreground">{service.category || '—'}</td>
                                                    <td className="p-4">
                                                        {service.is_active ? (
                                                            <span className="text-[10px] font-bold text-emerald-500 uppercase">Active</span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-amber-500 uppercase">Inactive</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right pr-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(service)}><Pencil size={14} /></Button>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive/40 hover:text-destructive" onClick={() => handleDelete(service.id)}><Trash2 size={14} /></Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {filteredServices?.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-xl opacity-50">
                                <p className="text-muted-foreground">No advisory services found matching your criteria.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Form Modal */}
            <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit' : 'New'} Advisory Service</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Title</label>
                            <Input className="bg-background border-border text-foreground" placeholder="Service Title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Pillar Association</label>
                            <Select 
                                value={form.pillar_id?.toString() || "none"} 
                                onValueChange={(val) => setForm({ ...form, pillar_id: val === "none" ? undefined : parseInt(val) })}
                            >
                                <SelectTrigger className="bg-background border-border text-foreground">
                                    <SelectValue placeholder="Select a pillar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Specific Pillar</SelectItem>
                                    {pillars?.map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Category (e.g. Energy Strategy)</label>
                            <Input className="bg-background border-border text-foreground" placeholder="Service Category" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Short Description</label>
                            <Input className="bg-background border-border text-foreground" placeholder="Brief overview for the card" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        
                        <div className="md:col-span-2">
                            <RichTextEditor 
                                label="Detailed Content"
                                value={form.content || ''}
                                onChange={(content) => setForm({ ...form, content })}
                                className="min-h-[200px]"
                            />
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
                                id="is_active_svc"
                                className="border-border"
                            />
                            <label htmlFor="is_active_svc" className="text-sm font-medium text-muted-foreground">Publicly Active</label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm} disabled={isSaving}>Cancel</Button>
                        <Button onClick={() => onSave()} disabled={isSaving} className="gap-2 bg-primary hover:bg-primary/90 text-[#14110b] font-bold">
                            {isSaving ? 'Saving...' : 'Save Service'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}

export default AdminServicesPage
