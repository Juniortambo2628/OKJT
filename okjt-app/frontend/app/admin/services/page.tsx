"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Activity, Shield, Zap, TrendingUp, BarChart, Globe, Mail, Users, Settings, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Service, Pillar } from '@/types/api'
import { cn } from '@/lib/utils'
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUploader from '@/components/admin/ImageUploader'
import { useApi } from '@/hooks/use-api'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { Card } from '@/components/ui/card'

const iconMap: Record<string, React.ElementType> = {
    Activity,
    Shield,
    Zap,
    TrendingUp,
    BarChart,
    Globe,
    Mail,
    Users,
    Settings,
}

export default function AdminServicesPage() {
    const { data: pillars } = useApi<Pillar[]>('/pillars')

    return (
        <AdminResourceTemplate<Service>
            endpoint="/services"
            resourceName="Service"
            title="Advisory Services"
            description="Manage your core advisory offerings and service categories."
            actionLabel="Add Service"
            gridColsClass="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            initialForm={{
                title: '',
                category: '',
                pillar_id: undefined,
                description: '',
                content: '',
                icon: 'Activity',
                is_active: true,
            }}
            filterFn={(service, term) =>
                service.title.toLowerCase().includes(term.toLowerCase()) ||
                (service.category || '').toLowerCase().includes(term.toLowerCase())
            }
            sortOptions={[
                { label: 'Date Created', value: 'created_at' },
                { label: 'Title', value: 'title' },
                { label: 'Category', value: 'category' },
            ]}
            onValidate={(form) => {
                if (!form.title) return 'Service Title is required'
                return null
            }}
            renderGridItem={(service, selectedIds, toggleSelect, handleEdit, handleDelete) => {
                const IconNode = iconMap[service.icon || 'Activity'] || Activity

                return (
                     <Card key={service.id} className="group relative border border-border p-5 overflow-hidden hover:border-primary/40 transition-all flex flex-col shadow-sm">
                         <div className="absolute top-4 left-4 z-10">
                             <Checkbox 
                                 checked={selectedIds.includes(service.id)}
                                 onCheckedChange={() => toggleSelect(service.id)}
                                 className="border-border bg-background/50"
                             />
                         </div>
                         <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="flex items-center gap-1">
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 bg-background/50 backdrop-blur-sm border border-border" onClick={() => handleEdit(service)}>
                                     <Pencil size={14} />
                                 </Button>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/40 bg-background/50 backdrop-blur-sm border border-border hover:text-destructive" onClick={() => handleDelete(service.id)}>
                                     <Trash2 size={14} />
                                 </Button>
                             </div>
                         </div>

                         <div className="mb-5 w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl ring-1 ring-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                             <IconNode size={26} />
                         </div>

                         <div className="space-y-2 flex-1">
                             <div className="flex items-center gap-2">
                                 <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider">{service.category || 'Advisory'}</span>
                                 {!service.is_active && <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5">Inactive</span>}
                             </div>
                             <h3 className="font-bold text-lg leading-tight text-foreground">{service.title}</h3>
                             <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{service.description}</p>
                         </div>

                         <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                             <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-muted-foreground hover:text-foreground" onClick={() => handleEdit(service)}>
                                 Update details
                             </Button>
                             <a href={`/services#${service.slug}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                 <ExternalLink size={16} />
                             </a>
                         </div>
                     </Card>
                )
            }}
            renderTableHeaders={(filteredServices, selectedIds, selectAll) => (
                <tr>
                    <th className="p-4 px-6 w-10">
                        <Checkbox 
                            checked={selectedIds.length === filteredServices?.length && filteredServices?.length > 0}
                            onCheckedChange={() => selectAll(filteredServices?.map((item) => item.id) || [])}
                        />
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Service</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Category</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="p-4 text-right"></th>
                </tr>
            )}
            renderTableRows={(filteredServices, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <>
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
                </>
            )}
            renderFormFields={(form, setForm) => (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Title</label>
                            <Input className="bg-background border-border text-foreground" placeholder="Service Title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Pillar Association</label>
                            <Select 
                                value={form.pillar_id?.toString() || 'none'} 
                                onValueChange={(val) => setForm({ ...form, pillar_id: val === 'none' ? undefined : parseInt(val, 10) })}
                            >
                                <SelectTrigger className="bg-background border-border text-foreground">
                                    <SelectValue placeholder="Select a pillar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Specific Pillar</SelectItem>
                                    {pillars?.map((pillar) => (
                                        <SelectItem key={pillar.id} value={pillar.id.toString()}>{pillar.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Category</label>
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
                                {Object.keys(iconMap).map((iconName) => (
                                    <Button 
                                        key={iconName}
                                        type="button"
                                        variant={form.icon === iconName ? 'secondary' : 'ghost'}
                                        className={cn('h-10 w-10 p-0', form.icon === iconName && 'ring-1 ring-primary')}
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
                </>
            )}
        />
    )
}
