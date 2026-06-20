"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { CaseStudy } from '@/types/api'
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUploader from '@/components/admin/ImageUploader'

interface CaseStudyFormFieldsProps {
    form: Partial<CaseStudy>
    setForm: (form: Partial<CaseStudy>) => void
}

export default function CaseStudyFormFields({ form, setForm }: CaseStudyFormFieldsProps) {
    return (
        <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Input className="bg-background border-border text-foreground" value={form.website_url || ''} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="e.g. https://project-link.com" />
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

                <div className="space-y-2">
                    <Label className="text-muted-foreground font-bold">Gallery Images (comma separated URLs)</Label>
                    <Input 
                        className="bg-background border-border text-foreground" 
                        value={Array.isArray(form.gallery) ? form.gallery.join(', ') : (form.gallery || '')} 
                        onChange={(e) => setForm({ ...form, gallery: e.target.value.split(',').map(t => t.trim()) })} 
                        placeholder="Enter image URLs separated by comma" 
                    />
                    <div className="text-[10px] text-muted-foreground/50">Note: You can use Cloudinary URLs or local paths.</div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <Checkbox 
                    id="is_featured_modal" 
                    checked={!!form.is_featured} 
                    onCheckedChange={(checked) => setForm({ ...form, is_featured: !!checked })} 
                    className="border-border"
                />
                <Label htmlFor="is_featured_modal" className="text-muted-foreground">Featured Case Study</Label>
            </div>
        </div>
    )
}
