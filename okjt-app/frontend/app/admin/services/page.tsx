"use client"

import React from 'react'
import { Activity, ExternalLink } from 'lucide-react'
import { iconMap } from '@/components/admin/constants'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Service, Pillar } from '@/types/api'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { useApi } from '@/hooks/use-api'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { ResourceCard } from '@/components/admin/ResourceCard'
import { ResourceTableRow } from '@/components/admin/ResourceTableRow'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { IconPicker } from '@/components/admin/IconPicker'

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
                     <ResourceCard
                         item={service}
                         selectedIds={selectedIds}
                         onToggleSelect={toggleSelect}
                         onEdit={handleEdit}
                         onDelete={handleDelete}
                     >
                         <div className="p-5">
                             <div className="mb-5 w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl ring-1 ring-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                 <IconNode size={26} />
                             </div>

                             <div className="space-y-2 flex-1">
                                 <div className="flex items-center gap-2">
                                     <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider">{service.category || 'Advisory'}</span>
                                     <StatusBadge isActive={!!service.is_active} />
                                 </div>
                                 <h3 className="font-bold text-lg leading-tight text-foreground">{service.title}</h3>
                                 <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{service.description}</p>
                             </div>

                             <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                                 <span className="text-xs font-bold text-muted-foreground">Update details</span>
                                 <a href={`/services#${service.slug}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                     <ExternalLink size={16} />
                                 </a>
                             </div>
                         </div>
                     </ResourceCard>
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
                            <ResourceTableRow
                                key={service.id}
                                item={service}
                                selectedIds={selectedIds}
                                onToggleSelect={toggleSelect}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            >
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
                                    <StatusBadge isActive={!!service.is_active} />
                                </td>
                            </ResourceTableRow>
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
                            <IconPicker
                                selectedIcon={form.icon || 'Activity'}
                                onSelect={(iconName) => setForm({ ...form, icon: iconName })}
                                icons={iconMap}
                            />
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
