"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import ImageUploader from '@/components/admin/ImageUploader'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { ResourceCard } from '@/components/admin/ResourceCard'
import { ResourceTableRow } from '@/components/admin/ResourceTableRow'
import { StatusBadge } from '@/components/admin/StatusBadge'

const AdminTestimonialsPage = () => {
    return (
        <AdminResourceTemplate<any>
            endpoint="/testimonials"
            resourceName="Testimonial"
            title="Testimonials"
            description="Manage client testimonials displayed on the landing page."
            actionLabel="Add Testimonial"
            statusField="is_featured"
            dialogSizeClass="max-w-3xl"
            initialForm={{
                name: '',
                role: '',
                company: '',
                quote: '',
                avatar: '',
                rating: 5,
                is_featured: true,
                order: 0,
            }}
            filterFn={(t, term) => 
                (t.name || '').toLowerCase().includes(term.toLowerCase()) ||
                (t.company || '').toLowerCase().includes(term.toLowerCase())
            }
            onValidate={(form) => {
                if (!form.name || !form.quote) return "Name and Quote are required"
                return null
            }}
            
            renderGridItem={(t, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <ResourceCard
                    item={t}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                >
                    <CardContent className="p-6 pt-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-1">
                                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                        </div>
                        <blockquote className="text-sm text-foreground/70 italic mb-4 line-clamp-4">
                            &ldquo;{t.quote}&rdquo;
                        </blockquote>
                        <div className="border-t border-border/50 pt-3 flex items-center gap-3">
                            {t.avatar ? (
                                <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <User size={14} />
                                </div>
                            )}
                            <div>
                                <div className="font-bold text-sm flex items-center gap-2">
                                    {t.name}
                                    {t.is_featured && (
                                        <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">Featured</span>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">{t.role}, {t.company}</div>
                            </div>
                        </div>
                    </CardContent>
                </ResourceCard>
            )}

            renderTableHeaders={(filteredTestimonials, selectedIds, selectAll) => (
                <tr>
                    <th className="p-4 px-6 w-10">
                        <Checkbox
                            checked={selectedIds.length === filteredTestimonials?.length && filteredTestimonials?.length > 0}
                            onCheckedChange={() => selectAll(filteredTestimonials?.map(i => i.id) || [])}
                        />
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Client</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Quote</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="p-4 text-right pr-6"></th>
                </tr>
            )}

            renderTableRows={(filteredTestimonials, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <>
                    {filteredTestimonials?.map((t: any) => (
                        <ResourceTableRow
                            key={t.id}
                            item={t}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleSelect}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        >
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    {t.avatar ? (
                                        <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User size={12} />
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-bold text-sm">{t.name}</div>
                                        <div className="text-xs text-muted-foreground">{t.role}, {t.company}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-xs text-muted-foreground max-w-md truncate">
                                &ldquo;{t.quote}&rdquo;
                            </td>
                            <td className="p-4">
                                <StatusBadge
                                    isActive={!!t.is_featured}
                                    activeLabel="Featured"
                                    inactiveLabel="Standard"
                                    variant="featured"
                                />
                            </td>
                        </ResourceTableRow>
                    ))}
                </>
            )}

            renderFormFields={(form, setForm) => (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Client Name</label>
                            <Input placeholder="Client Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role / Title</label>
                            <Input placeholder="Role / Title" value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company</label>
                            <Input placeholder="Company" value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                        </div>
                    </div>
                    
                    <ImageUploader 
                        label="Client Avatar"
                        value={form.avatar || ''}
                        onChange={(url) => setForm({ ...form, avatar: url })}
                        maxSizeMB={10}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Testimonial Quote</label>
                        <textarea
                            placeholder="Testimonial quote..."
                            value={form.quote || ''}
                            onChange={(e) => setForm({ ...form, quote: e.target.value })}
                            className="w-full bg-secondary/5 border border-border rounded-md p-3 text-sm min-h-[120px] resize-y focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rating (1-5)</label>
                            <Input type="number" placeholder="Rating" value={form.rating || 5} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })} min={1} max={5} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sort Order</label>
                            <Input type="number" placeholder="Sort Order" value={form.order || 0} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="flex items-center gap-2 pt-8">
                            <Checkbox
                                checked={form.is_featured ?? true}
                                onCheckedChange={(checked: boolean) => setForm({ ...form, is_featured: !!checked })}
                                id="is_featured_testimonial"
                                className="border-border"
                            />
                            <label htmlFor="is_featured_testimonial" className="text-sm font-medium">Featured</label>
                        </div>
                    </div>
                </>
            )}
        />
    )
}

export default AdminTestimonialsPage
