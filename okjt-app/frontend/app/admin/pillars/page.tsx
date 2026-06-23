"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ExternalLink, Activity, Shield, Zap, TrendingUp, BarChart, Globe, Mail, Users, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Pillar } from '@/types/api'
import { cn } from '@/lib/utils'
import ImageUploader from '@/components/admin/ImageUploader'
import RichTextEditor from '@/components/admin/RichTextEditor'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'

const iconMap: Record<string, React.ElementType> = {
    Activity, Shield, Zap, TrendingUp, BarChart, Globe, Mail, Users, Settings,
}

const AdminPillarsPage = () => {
    return (
        <AdminResourceTemplate<Pillar>
            endpoint="/pillars"
            resourceName="Pillar"
            title="Brand Core Pillars"
            description="Manage the foundational pillars and core values that drive your engineering approach."
            actionLabel="Add Pillar"
            dialogSizeClass="max-w-4xl"
            gridColsClass="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            initialForm={{
                title: '',
                overview: '',
                content: '',
                icon: 'Activity',
                image: '',
                is_active: true,
            }}
            filterFn={(p, term) =>
                p.title.toLowerCase().includes(term.toLowerCase())
            }
            sortOptions={[
                { label: 'Date Created', value: 'created_at' },
                { label: 'Title', value: 'title' },
            ]}
            onValidate={(form) => {
                if (!form.title) return 'Title is required'
                return null
            }}
            renderGridItem={(pillar, selectedIds, toggleSelect, handleEdit, handleDelete) => {
                const IconNode = iconMap[pillar.icon || 'Activity'] || Activity

                return (
                    <div key={pillar.id} className="group relative bg-secondary/10 border border-border p-6 overflow-hidden hover:border-primary/40 transition-all flex flex-col shadow-sm">
                        <div className="absolute top-4 left-4 z-10">
                            <Checkbox
                                checked={selectedIds.includes(pillar.id)}
                                onCheckedChange={() => toggleSelect(pillar.id)}
                                className="border-border bg-background/50"
                            />
                        </div>
                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 bg-background/50 backdrop-blur-sm border border-border" onClick={() => handleEdit(pillar)}>
                                    <Pencil size={14} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/40 bg-background/50 backdrop-blur-sm border border-border hover:text-destructive" onClick={() => handleDelete(pillar.id)}>
                                    <Trash2 size={14} />
                                </Button>
                            </div>
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
                            <tr key={pillar.id} className="hover:bg-primary/5 transition-colors group">
                                <td className="p-4 px-6">
                                    <Checkbox
                                        checked={selectedIds.includes(pillar.id)}
                                        onCheckedChange={() => toggleSelect(pillar.id)}
                                        className="border-border"
                                    />
                                </td>
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
                                        <div className="font-bold text-sm group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleEdit(pillar)}>{pillar.title}</div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                        <IconNode size={14} />
                                    </div>
                                </td>
                                <td className="p-4">
                                    {pillar.is_active ? (
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Active</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-amber-500 uppercase">Inactive</span>
                                    )}
                                </td>
                                <td className="p-4 text-xs text-muted-foreground">
                                    {pillar.created_at ? new Date(pillar.created_at).toLocaleDateString() : '—'}
                                </td>
                                <td className="p-4 text-right pr-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(pillar)}><Pencil size={14} /></Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive/40 hover:text-destructive" onClick={() => handleDelete(pillar.id)}><Trash2 size={14} /></Button>
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
                </>
            )}
        />
    )
}

export default AdminPillarsPage
