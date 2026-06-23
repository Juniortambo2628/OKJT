"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ExternalLink, ImageIcon, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Insight } from '@/types/api'
import ImageUploader from '@/components/admin/ImageUploader'
import RichTextEditor from '@/components/admin/RichTextEditor'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'

const AdminInsightsPage = () => {
    return (
        <AdminResourceTemplate<Insight>
            endpoint="/insights"
            resourceName="Insight"
            title="Market Insights"
            description="Manage your energy intelligence and articles."
            actionLabel="Create Insight"
            statusField="is_published"
            dialogSizeClass="max-w-4xl"
            gridColsClass="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            initialForm={{
                title: '',
                category: '',
                excerpt: '',
                content: '',
                image: '',
                is_published: false,
            }}
            filterFn={(i, term) =>
                i.title.toLowerCase().includes(term.toLowerCase()) ||
                (i.category || '').toLowerCase().includes(term.toLowerCase())
            }
            sortOptions={[
                { label: 'Date Created', value: 'created_at' },
                { label: 'Title', value: 'title' },
                { label: 'Category', value: 'category' },
            ]}
            activeLabel="Published"
            inactiveLabel="Draft"
            onValidate={(form) => {
                if (!form.title) return 'Title is required'
                return null
            }}
            renderGridItem={(insight, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <div key={insight.id} className="group relative bg-secondary/10 border border-border overflow-hidden hover:border-primary/40 transition-all flex flex-col shadow-sm">
                    <div className="absolute top-3 left-3 z-10">
                        <Checkbox
                            checked={selectedIds.includes(insight.id)}
                            onCheckedChange={() => toggleSelect(insight.id)}
                            className="border-border bg-background/50"
                        />
                    </div>
                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                            <Button variant="secondary" size="icon" className="h-8 w-8 p-0 bg-background/80 border border-border/50" onClick={() => handleEdit(insight)}>
                                <Pencil size={14} />
                            </Button>
                            <a href={`/insights/${insight.slug}`} target="_blank" className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-background/80 border border-border/50 text-muted-foreground hover:text-primary transition-colors">
                                <ExternalLink size={14} />
                            </a>
                            <Button variant="secondary" size="icon" className="h-8 w-8 p-0 bg-background/80 border border-border/50 text-destructive/60 hover:text-destructive" onClick={() => handleDelete(insight.id)}>
                                <Trash2 size={14} />
                            </Button>
                        </div>
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
            )}
            renderTableHeaders={(items, selectedIds, selectAll) => (
                <tr>
                    <th className="p-4 px-6 w-10">
                        <Checkbox
                            checked={selectedIds.length === items?.length && items?.length > 0}
                            onCheckedChange={() => selectAll(items?.map((item) => item.id) || [])}
                        />
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Title</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Category</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Date</th>
                    <th className="p-4 text-right"></th>
                </tr>
            )}
            renderTableRows={(items, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <>
                    {items?.map((insight) => (
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
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(insight)}><Pencil size={14} /></Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive/40 hover:text-destructive" onClick={() => handleDelete(insight.id)}><Trash2 size={14} /></Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </>
            )}
            renderFormFields={(form, setForm) => (
                <>
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
                </>
            )}
        />
    )
}

export default AdminInsightsPage
