"use client"

import React from 'react'
import { ExternalLink, Activity } from 'lucide-react'
import { iconMap } from '@/components/admin/constants'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Pillar } from '@/types/api'
import ImageUploader from '@/components/admin/ImageUploader'
import RichTextEditor from '@/components/admin/RichTextEditor'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { ResourceCard } from '@/components/admin/ResourceCard'
import { ResourceTableRow } from '@/components/admin/ResourceTableRow'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { IconPicker } from '@/components/admin/IconPicker'
import { pillarsConfig } from '@/components/admin/configs/pillars.config'

const AdminPillarsPage = () => {
    const { endpoint, resourceName, title, description, actionLabel, initialForm, validate, filterFn, fields, ...configRest } = pillarsConfig

    return (
        <AdminResourceTemplate<Pillar>
            endpoint={endpoint}
            resourceName={resourceName}
            title={title}
            description={description}
            actionLabel={actionLabel}
            gridColsClass="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            initialForm={initialForm}
            filterFn={filterFn}
            onValidate={validate}
            {...configRest}
            sortOptions={[
                { label: 'Date Created', value: 'created_at' },
                { label: 'Title', value: 'title' },
            ]}
            renderGridItem={(pillar, selectedIds, toggleSelect, handleEdit, handleDelete) => {
                const IconNode = iconMap[pillar.icon || 'Activity'] || Activity

                return (
                    <ResourceCard
                        item={pillar}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    >
                        <div className="p-6">
                            <div className="mb-6 w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-xl ring-1 ring-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <IconNode size={32} />
                            </div>

                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2">
                                    <StatusBadge isActive={!!pillar.is_active} />
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
                                <span className="text-xs font-bold text-muted-foreground">Manage Pillar</span>
                                <a href={`/our-approach/${pillar.slug}`} target="_blank" className="text-muted-foreground hover:text-primary transition-colors"><ExternalLink size={16} /></a>
                            </div>
                        </div>
                    </ResourceCard>
                )
            }}
            renderTableHeaders={(items, selectedIds, selectAll) => (
                <tr>
                    <th className="p-4 px-6 w-10">
                        <Checkbox
                            checked={selectedIds.length === items?.length && items?.length > 0}
                            onCheckedChange={() => selectAll(items?.map((item) => item.id) || [])}
                        />
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Title</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Icon</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Active</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Created</th>
                    <th className="p-4 text-right"></th>
                </tr>
            )}
            renderTableRows={(items, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <>
                    {items?.map((pillar) => {
                        const IconNode = iconMap[pillar.icon || 'Activity'] || Activity

                        return (
                            <ResourceTableRow
                                key={pillar.id}
                                item={pillar}
                                selectedIds={selectedIds}
                                onToggleSelect={toggleSelect}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-4">
                                        {pillar.image ? (
                                            <div className="w-10 h-10 rounded bg-secondary overflow-hidden shrink-0 border border-border/50">
                                                <img src={pillar.image} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <IconNode size={17} />
                                            </div>
                                        )}
                                        <div className="font-bold text-sm group-hover:text-primary transition-colors cursor-pointer">{pillar.title}</div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                        <IconNode size={14} />
                                    </div>
                                </td>
                                <td className="p-4">
                                    <StatusBadge isActive={!!pillar.is_active} />
                                </td>
                                <td className="p-4 text-xs text-muted-foreground">
                                    {pillar.created_at ? new Date(pillar.created_at).toLocaleDateString() : '—'}
                                </td>
                            </ResourceTableRow>
                        )
                    })}
                </>
            )}
            renderFormFields={(form, setForm) => (
                <>
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
                            <label className="text-sm font-medium text-muted-foreground">Overview Background Image</label>
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
                                id="is_active_pillar"
                                className="border-border"
                            />
                            <label htmlFor="is_active_pillar" className="text-sm font-medium text-muted-foreground">Active</label>
                        </div>
                    </div>
                </>
            )}
        />
    )
}

export default AdminPillarsPage
