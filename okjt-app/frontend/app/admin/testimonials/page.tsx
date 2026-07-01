"use client"

import React from 'react'
import { Star, User } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { CardContent } from '@/components/ui/card'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { ResourceCard } from '@/components/admin/ResourceCard'
import { ResourceTableRow } from '@/components/admin/ResourceTableRow'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { renderFieldsFromConfig } from '@/components/admin/AdminResourceConfig'
import { testimonialsConfig } from '@/components/admin/configs/testimonials.config'
import { Testimonial } from '@/types/api'

const AdminTestimonialsPage = () => {
    const { endpoint, resourceName, title, description, actionLabel, initialForm, validate, filterFn, fields, ...configRest } = testimonialsConfig

    return (
        <AdminResourceTemplate<Testimonial>
            endpoint={endpoint}
            resourceName={resourceName}
            title={title}
            description={description}
            actionLabel={actionLabel}
            initialForm={initialForm}
            filterFn={filterFn}
            onValidate={validate}
            {...configRest}
            renderGridItem={(t, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <ResourceCard
                    item={t}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={14} className={star <= (t.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'} />
                            ))}
                        </div>
                        <p className="text-sm italic text-muted-foreground line-clamp-4 mb-4">"{t.quote}"</p>
                        <div className="flex items-center gap-3">
                            {t.avatar ? (
                                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User size={18} className="text-primary/40" />
                                </div>
                            )}
                            <div>
                                <div className="font-bold text-sm flex items-center gap-2">
                                    {t.name}
                                    {t.is_featured && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">Featured</span>}
                                </div>
                                <div className="text-xs text-muted-foreground">{t.role} {t.company ? `at ${t.company}` : ''}</div>
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
                    {filteredTestimonials?.map((t) => (
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
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User size={14} className="text-primary/40" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-bold text-sm">{t.name}</div>
                                        <div className="text-xs text-muted-foreground">{t.role} {t.company ? `at ${t.company}` : ''}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-xs text-muted-foreground max-w-md truncate italic">"{t.quote}"</td>
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

            renderFormFields={(form, setForm) => renderFieldsFromConfig(fields, form as Record<string, any>, setForm as any)}
        />
    )
}

export default AdminTestimonialsPage
