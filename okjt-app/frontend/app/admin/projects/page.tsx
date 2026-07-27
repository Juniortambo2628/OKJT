"use client"

import React from 'react'
import { ExternalLink, Star } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Project } from '@/types/api'
import { getMediaUrl } from '@/lib/utils'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import ProjectFormFields from '@/components/admin/forms/ProjectFormFields'
import { ResourceCard } from '@/components/admin/ResourceCard'
import { ResourceTableRow } from '@/components/admin/ResourceTableRow'
import { StatusBadge } from '@/components/admin/StatusBadge'

const AdminProjectsPage = () => {
    return (
        <AdminResourceTemplate<Project>
            endpoint="/projects"
            resourceName="Project"
            title="Projects"
            description="Manage all client engagements and flagship innovations in one place."
            actionLabel="Add Project"
            statusField="is_active"
            initialForm={{
                type: 'client',
                title: '',
                tagline: '',
                category: '',
                technologies: [],
                significant_figure: '',
                description: '',
                problem: '',
                methodology: '',
                outcome: '',
                testimonial_quote: '',
                testimonial_author: '',
                image: '',
                bg_image: '',
                gallery: [],
                url: '',
                is_active: true,
                is_featured: false,
                order: 0,
            }}
            filterFn={(project: Project, term: string) => {
                const s = term.toLowerCase()
                return (
                    project.title.toLowerCase().includes(s) ||
                    (project.client_name || '').toLowerCase().includes(s) ||
                    (project.category || '').toLowerCase().includes(s)
                )
            }}
            onValidate={(form) => {
                if (!form.title) return 'Title is required.'
                return null
            }}
            filterPlaceholder="Search by title, client, or category..."
            dialogSizeClass="max-w-4xl"
            gridColsClass="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            sortOptions={[
                { label: 'Title', value: 'title' },
                { label: 'Created', value: 'created_at' },
                { label: 'Order', value: 'order' },
            ]}
            renderFormFields={(form, setForm) => (
                <ProjectFormFields form={form} setForm={setForm} />
            )}
            renderGridItem={(item, selectedIds, toggleSelect, onEdit, onDelete) => (
                <ResourceCard
                    item={item}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                >
                    <div className="aspect-video relative overflow-hidden bg-secondary/30">
                        {item.image ? (
                            <img src={getMediaUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary/20">
                                <Star size={48} />
                            </div>
                        )}
                        {item.is_featured && (
                            <div className="absolute top-4 right-4 z-10">
                                <Star size={20} className="fill-yellow-500 text-yellow-500 drop-shadow-lg" />
                            </div>
                        )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                item.type === 'flagship'
                                     ? 'bg-violet-500/10 text-violet-500'
                                     : 'bg-primary/10 text-primary'
                            }`}>
                                {item.type}
                            </span>
                            {item.category && (
                                <span className="px-2 py-0.5 bg-secondary/50 text-muted-foreground text-[9px] font-bold uppercase tracking-wider">
                                    {item.category}
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-base leading-tight mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors cursor-pointer">
                            {item.title}
                        </h3>
                        {item.tagline && (
                            <div className="text-xs text-muted-foreground italic mb-2 line-clamp-2">{item.tagline}</div>
                        )}
                        {item.significant_figure && (
                            <div className="text-xs text-primary font-bold mb-4">{item.significant_figure}</div>
                        )}
                    </div>

                    <div className="px-5 pb-5 pt-0 flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">Edit</span>
                        <div className="flex items-center gap-2">
                            {item.url && (
                                <a
                                    href={item.url || '#'}
                                    target="_blank"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <ExternalLink size={16} />
                                </a>
                            )}
                        </div>
                    </div>
                </ResourceCard>
            )}
            renderTableHeaders={(items, selectedIds, selectAll) => (
                <tr>
                    <th className="p-4 px-6 w-10">
                        <Checkbox
                            checked={selectedIds.length === items.length && items.length > 0}
                            onCheckedChange={() => {
                                if (selectedIds.length === items.length) selectAll([])
                                else selectAll(items.map((i) => i.id))
                            }}
                        />
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Title</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Type</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Category</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Featured</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Created</th>
                    <th className="p-4 text-right"><span className="sr-only">Actions</span></th>
                </tr>
            )}
            renderTableRows={(items, selectedIds, toggleSelect, onEdit, onDelete) => (
                items.map((item) => (
                    <ResourceTableRow
                        key={item.id}
                        item={item}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    >
                        <td className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded bg-secondary overflow-hidden shrink-0 border border-border/50">
                                    {item.image ? (
                                        <img src={getMediaUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary/40">
                                            <Star size={16} />
                                        </div>
                                    )}
                                </div>
                                <div className="font-bold line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
                                    {item.title}
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                                item.type === 'flagship'
                                    ? 'bg-violet-500/10 text-violet-500'
                                    : 'bg-primary/10 text-primary'
                            }`}>
                                {item.type}
                            </span>
                        </td>
                        <td className="p-4 text-xs font-medium text-muted-foreground">{item.category || '—'}</td>
                        <td className="p-4">
                            {item.is_featured ? <Star size={14} className="fill-yellow-500 text-yellow-500" /> : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                        </td>
                    </ResourceTableRow>
                ))
            )}
        />
    )
}

export default AdminProjectsPage
