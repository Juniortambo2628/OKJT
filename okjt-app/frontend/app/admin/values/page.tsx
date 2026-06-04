"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, Shield, Globe, Zap, Landmark, Star, Award, Heart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import AdminPageHeader from '@/components/admin/core/AdminPageHeader'
import AdminResourceToolbar from '@/components/admin/core/AdminResourceToolbar'
import { useAdminResource } from '@/hooks/use-admin-resource'

const availableIcons = {
    Shield, Globe, Zap, Landmark, Star, Award, Heart
}

export default function AdminValuesPage() {
    const {
        filteredData: filteredValues,
        isLoading,
        searchTerm,
        setSearchTerm,
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
        form: formData,
        setForm: setFormData,
        resetForm,
        handleEdit,
        handleSave,
        handleDelete,
        handleBulkDelete,
    } = useAdminResource<any>({
        endpoint: '/values',
        resourceName: 'Value',
        initialForm: {
            icon: 'Shield',
            title: '',
            description: '',
            order: 0
        },
        filterFn: (v, term) => 
            (v.title || '').toLowerCase().includes(term.toLowerCase()) ||
            (v.description || '').toLowerCase().includes(term.toLowerCase()),
        sortFns: {
            order: (a, b) => (a.order || 0) - (b.order || 0),
            title: (a, b) => (a.title || '').localeCompare(b.title || '')
        }
    })

    // Set page defaults for sorting
    React.useEffect(() => {
        setSortBy('order')
        setSortOrder('asc')
    }, [setSortBy, setSortOrder])

    const onSave = async () => {
        if (!formData.title || !formData.description) {
            return
        }
        await handleSave()
    }

    return (
        <AdminLayout>
            <div className="space-y-8 font-inter">
                <AdminPageHeader 
                    title="Company Values"
                    description="Manage the core values displayed on the About page."
                    actionLabel="Add Value"
                    onAction={() => { resetForm(); setShowForm(true); }}
                />

                <AdminResourceToolbar 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search company values..."
                    
                    hideStatusFilter={true}
                    
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    sortOrder={sortOrder}
                    onOrderChange={setSortOrder}
                    sortOptions={[
                        { label: 'Sort Order', value: 'order' },
                        { label: 'Alphabetical', value: 'title' }
                    ]}
                    
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    
                    selectedCount={selectedIds.length}
                    onBulkDelete={handleBulkDelete}
                />

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-secondary/20 animate-pulse border border-border/50" />)}
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredValues?.map((val) => {
                                    const IconComp = (availableIcons as any)[val.icon] || Shield
                                    return (
                                        <div key={val.id} className="group relative bg-secondary/10 border border-border/50 p-6 flex flex-col hover:border-primary/40 transition-all">
                                            <Checkbox 
                                                checked={selectedIds.includes(val.id)}
                                                onCheckedChange={() => toggleSelect(val.id)}
                                                className="absolute top-4 left-4 border-white/20"
                                            />
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-primary/10 text-primary border border-primary/20 ml-8">
                                                    <IconComp size={24} />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(val)}><Edit2 size={14} /></Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(val.id)} className="text-destructive"><Trash2 size={14} /></Button>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-lg mb-2">{val.title}</h3>
                                            <p className="text-muted-foreground text-sm flex-1">{val.description}</p>
                                            <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                Order: {val.order}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="bg-secondary/10 border border-border/50 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-secondary/20 border-b border-border/50">
                                        <tr>
                                            <th className="p-4 px-6 w-10">
                                                <Checkbox 
                                                    checked={selectedIds.length === filteredValues?.length && filteredValues?.length > 0}
                                                    onCheckedChange={(checked: boolean) => {
                                                        if (checked) selectAll(filteredValues?.map(v => v.id) || [])
                                                        else selectAll([])
                                                    }}
                                                    className="border-white/20"
                                                />
                                            </th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Title</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground text-right flex-1">Description</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Order</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredValues?.map((val) => {
                                            const IconComp = (availableIcons as any)[val.icon] || Shield
                                            return (
                                                <tr key={val.id} className="hover:bg-primary/5 transition-colors group">
                                                    <td className="p-4 px-6">
                                                        <Checkbox 
                                                            checked={selectedIds.includes(val.id)}
                                                            onCheckedChange={() => toggleSelect(val.id)}
                                                            className="border-white/20"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-primary/10 text-primary border border-primary/20 shrink-0">
                                                                <IconComp size={16} />
                                                            </div>
                                                            <div className="font-bold">{val.title}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-xs text-muted-foreground max-w-xs">{val.description}</td>
                                                    <td className="p-4 text-xs font-bold text-primary">{val.order}</td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(val)}><Edit2 size={14} /></Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(val.id)} className="text-destructive"><Trash2 size={14} /></Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {filteredValues?.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-border/50">
                                <p className="text-muted-foreground">No values found.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent className="max-w-md bg-[#0a1128] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Value' : 'Add Value'}</DialogTitle>
                        <DialogDescription className="text-white/50">Manage core company value.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Icon</Label>
                            <div className="grid grid-cols-7 gap-2">
                                {Object.keys(availableIcons).map((iconName) => {
                                    const Icon = (availableIcons as any)[iconName]
                                    return (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => setFormData({...formData, icon: iconName})}
                                            className={cn(
                                                "p-2 border transition-all hover:bg-primary/20",
                                                formData.icon === iconName ? "border-primary bg-primary/20" : "border-white/5 bg-white/5"
                                            )}
                                        >
                                            <Icon size={20} className={cn(formData.icon === iconName ? "text-primary" : "text-white/40")} />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input 
                                className="bg-white/5 border-white/10"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea 
                                className="bg-white/5 border-white/10 min-h-[100px]"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Display Order</Label>
                            <Input 
                                type="number"
                                className="bg-white/5 border-white/10"
                                value={formData.order || 0}
                                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm} disabled={isSaving} className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</Button>
                        <Button onClick={onSave} disabled={isSaving} className="bg-primary hover:bg-primary/95 text-black">
                            {isSaving ? 'Saving...' : 'Save Value'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
