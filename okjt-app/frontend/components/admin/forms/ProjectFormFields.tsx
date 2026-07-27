"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Project } from '@/types/api'
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUploader from '@/components/admin/ImageUploader'
import MultiImageUploader from '@/components/admin/MultiImageUploader'

interface ProjectFormFieldsProps {
    form: Partial<Project>
    setForm: (form: Partial<Project>) => void
}

export default function ProjectFormFields({ form, setForm }: ProjectFormFieldsProps) {
    return (
        <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-muted-foreground">Project Type</Label>
                    <select
                        className="bg-background border border-border text-foreground rounded-md px-3 py-2 text-sm w-full"
                        value={form.type || 'client'}
                        onChange={(e) => setForm({ ...form, type: e.target.value as 'client' | 'flagship' })}
                    >
                        <option value="client">Client</option>
                        <option value="flagship">Flagship</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label className="text-muted-foreground">Title</Label>
                    <Input className="bg-background border-border text-foreground" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                    <Label className="text-muted-foreground">Client Name</Label>
                    <Input className="bg-background border-border text-foreground" value={form.client_name || ''} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                    <Label className="text-muted-foreground">Category</Label>
                    <Input className="bg-background border-border text-foreground" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Health & Medical" />
                </div>
                <div className="space-y-2">
                    <Label className="text-muted-foreground">Website URL</Label>
                    <Input className="bg-background border-border text-foreground" value={form.url || ''} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="e.g. https://project-link.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-muted-foreground">Subtitle / Tagline (e.g. "Bridging the gap between tech and policy")</Label>
                    <Input className="bg-background border-border text-foreground" value={form.tagline || ''} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="e.g. Documenting love as it happens." />
                </div>
                <div className="space-y-2">
                    <Label className="text-muted-foreground">Badge / Key Result (Significant Figure)</Label>
                    <Input className="bg-background border-border text-foreground" value={form.significant_figure || ''} onChange={(e) => setForm({ ...form, significant_figure: e.target.value })} placeholder="e.g. Transactional SMTP, Live WebSockets Chat" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-muted-foreground">Short Description</Label>
                    <Input className="bg-background border-border text-foreground" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A brief summary for the project." />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-muted-foreground">Technologies (comma separated)</Label>
                <Input 
                    className="bg-background border-border text-foreground" 
                    value={Array.isArray(form.technologies) ? form.technologies.join(', ') : (form.technologies || '')} 
                    onChange={(e) => setForm({ ...form, technologies: e.target.value.split(',').map(t => t.trim()) })} 
                    placeholder="e.g. React, Laravel, PostgreSQL" 
                />
            </div>
            
            <RichTextEditor 
                label="The Problem"
                value={form.problem || ''}
                onChange={(val) => setForm({ ...form, problem: val })}
                className="min-h-[120px]"
            />

            <RichTextEditor 
                label="Methodology & Approach"
                value={form.methodology || ''}
                onChange={(val) => setForm({ ...form, methodology: val })}
                className="min-h-[120px]"
            />

            <RichTextEditor 
                label="Outcome & Results"
                value={form.outcome || ''}
                onChange={(val) => setForm({ ...form, outcome: val })}
                className="min-h-[120px]"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-border/50 rounded-lg bg-secondary/5">
                <div className="space-y-2">
                    <Label className="text-muted-foreground font-bold">Testimonial Author</Label>
                    <Input className="bg-background border-border text-foreground" value={form.testimonial_author || ''} onChange={(e) => setForm({ ...form, testimonial_author: e.target.value })} placeholder="e.g. Dr. Sarah Nyawira" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-muted-foreground font-bold">Testimonial Quote</Label>
                    <RichTextEditor 
                        value={form.testimonial_quote || ''}
                        onChange={(val) => setForm({ ...form, testimonial_quote: val })}
                        className="min-h-[100px]"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <ImageUploader
                    label="Featured Image"
                    value={form.image || ''}
                    onChange={(url) => setForm({ ...form, image: url })}
                />

                <MultiImageUploader
                    label="Gallery Images"
                    value={Array.isArray(form.gallery) ? form.gallery : []}
                    onChange={(urls) => setForm({ ...form, gallery: urls })}
                    maxImages={10}
                />
            </div>
            
            <div className="flex items-center gap-2">
                <Checkbox 
                    id="is_featured_modal" 
                    checked={!!form.is_featured} 
                    onCheckedChange={(checked) => setForm({ ...form, is_featured: !!checked })} 
                    className="border-border"
                />
                <Label htmlFor="is_featured_modal" className="text-muted-foreground">Featured Project</Label>
            </div>
        </div>
    )
}