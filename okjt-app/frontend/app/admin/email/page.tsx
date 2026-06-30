"use client"

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Mail, Eye, Code, CheckCircle2, AlertCircle, Sparkles, Layout, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from '@/lib/api'
import SettingsHeader from '@/components/admin/core/SettingsHeader'

const EmailSettingsPage = () => {
    const { data: emailTemplates, mutate, isLoading } = useApi<any[]>('/email-templates')
    const [formValues, setFormValues] = useState<Record<string, string>>({
        'email_template_admin': '',
        'email_template_user': ''
    })
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [activeTemplate, setActiveTemplate] = useState('admin_notification')
    const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual')
    const [previewHtml, setPreviewHtml] = useState<string>('')
    const [isPreviewLoading, setIsPreviewLoading] = useState(false)
    const [previewError, setPreviewError] = useState<string | null>(null)

    // Visual editor fields state
    const [visualFields, setVisualFields] = useState({
        badge: 'New Action Required',
        title: 'New Consultation Request',
        intro: 'A new consultation request has been submitted through the OKJTech website.',
        body: 'Details follow below...',
        buttonText: 'View in Dashboard'
    })

    useEffect(() => {
        if (emailTemplates) {
            const flat: Record<string, string> = {}
            emailTemplates.forEach((s: any) => {
                flat[s.key] = s.value || ''
            })
            setFormValues(prev => ({ ...prev, ...flat }))
            
            // Attempt to sync visual fields from existing code if possible
            // This is a simplified regex-based extractor for our known patterns
            const currentContent = flat[activeTemplate === 'admin_notification' ? 'email_template_admin' : 'email_template_user'] || ''
            if (currentContent) {
                const badgeMatch = currentContent.match(/class="badge"[^>]*>([^<]+)<\/div>/)
                const titleMatch = currentContent.match(/<h1>([^<]+)<\/h1>/)
                const introMatch = currentContent.match(/<\/h1>\s*<p>([^<]+)<\/p>/)
                const buttonMatch = currentContent.match(/>([^<]+)<\/a>/)
                
                setVisualFields({
                    badge: badgeMatch ? badgeMatch[1] : 'New Action Required',
                    title: titleMatch ? titleMatch[1] : 'New Notification',
                    intro: introMatch ? introMatch[1] : '',
                    buttonText: buttonMatch ? buttonMatch[1] : 'View Details',
                    body: visualFields.body // We keep body as is for now as it's harder to parse table structures
                })
            }
        }
    }, [emailTemplates, activeTemplate])

    const generateBladeFromVisual = () => {
        // This generates the template structure based on the provided layout
        return `<div class="badge" style="background-color: #3b82f6; color: #ffffff;">${visualFields.badge}</div>
<h1>${visualFields.title}</h1>
<p>${visualFields.intro}</p>

<div style="background-color: #050a1b; padding: 25px; border-radius: 8px; border: 1px solid #1e293b; margin: 20px 0;">
    <div style="color: #cbd5e1; line-height: 1.6;">
        ${visualFields.body?.replace(/\n/g, '<br />')}
    </div>
</div>

<a href="{{ config('app.frontend_url') }}/admin/requests" class="button">${visualFields.buttonText}</a>

<p style="margin-top: 30px; font-size: 12px; color: #64748b;">This is an automated notification from the OKJTech CMS.</p>`
    }

    const handleSave = async () => {
        setIsSaving(true)
        setSaveSuccess(false)
        try {
            const templateKey = activeTemplate === 'admin_notification' ? 'email_template_admin' : 'email_template_user'
            const contentToSave = editorMode === 'visual' ? generateBladeFromVisual() : formValues[templateKey]

            await api.put(`/email-templates/${templateKey}`, { value: contentToSave, type: 'code' })
            mutate()
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err) {
            alert('Failed to save email settings')
        } finally {
            setIsSaving(false)
        }
    }

    const handlePreview = async () => {
        setIsPreviewLoading(true)
        setPreviewError(null)
        try {
            const templateKey = activeTemplate === 'admin_notification' ? 'email_template_admin' : 'email_template_user'
            const content = editorMode === 'visual' ? generateBladeFromVisual() : formValues[templateKey]
            
            const response = await api.post('/email-templates/preview', {
                template_key: templateKey,
                content: content
            })
            setPreviewHtml(response.data.html)
        } catch (err: any) {
            setPreviewError(err.response?.data?.error || 'Failed to render preview')
        } finally {
            setIsPreviewLoading(false)
        }
    }

    const insertVariable = (variable: string) => {
        if (editorMode === 'visual') {
            setVisualFields(prev => ({ ...prev, body: prev.body + ' ' + variable }))
        } else {
            const templateKey = activeTemplate === 'admin_notification' ? 'email_template_admin' : 'email_template_user'
            setFormValues(prev => ({ ...prev, [templateKey]: prev[templateKey] + ' ' + variable }))
        }
    }

    const handleDelete = async () => {
        const templateKey = activeTemplate === 'admin_notification' ? 'email_template_admin' : 'email_template_user'
        if (!confirm(`Delete the ${activeTemplate === 'admin_notification' ? 'admin' : 'user'} email template?`)) return

        setIsSaving(true)
        try {
            await api.delete(`/email-templates/${templateKey}`)
            setFormValues(prev => ({ ...prev, [templateKey]: '' }))
            mutate()
        } catch (err) {
            alert('Failed to delete email template')
        } finally {
            setIsSaving(false)
        }
    }

    const variablePalette = [
        { label: 'First Name', value: '{{ $requestData->first_name }}' },
        { label: 'Last Name', value: '{{ $requestData->last_name }}' },
        { label: 'Email', value: '{{ $requestData->email }}' },
        { label: 'Message Body', value: '{{ $requestData->message }}' },
        { label: 'Subject', value: '{{ $requestData->subject }}' },
    ]

    const templates = [
        { id: 'admin_notification', title: 'Admin Alert', key: 'email_template_admin', description: 'Template for internal team notifications.' },
        { id: 'user_receipt', title: 'User Confirmation', key: 'email_template_user', description: 'Template for the acknowledgment email sent to users.' },
    ]

    return (
        <AdminLayout>
            <div className="space-y-8">
                <SettingsHeader
                    title="Email Configuration"
                    description="Customize automated emails with a user-friendly visual editor."
                    onSave={handleSave}
                    onDelete={handleDelete}
                    isSaving={isSaving}
                    isLoading={false}
                    deleteLabel="Delete"
                    deleteDisabled={isSaving}
                >
                    <Button
                        variant="outline"
                        onClick={handlePreview}
                        disabled={isPreviewLoading}
                        className="gap-2 bg-background border-border text-foreground hover:bg-secondary"
                    >
                        {isPreviewLoading ? <span className="animate-spin">⏳</span> : <Eye size={16} />}
                        Live Preview
                    </Button>
                </SettingsHeader>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Left Panel: Controls */}
                    <div className="xl:col-span-2 space-y-6">
                        <Tabs value={activeTemplate} onValueChange={setActiveTemplate} className="w-full">
                            <TabsList className="bg-secondary/10 border border-border w-full justify-start h-auto p-1 text-foreground">
                                {templates.map(t => (
                                    <TabsTrigger key={t.id} value={t.id} className="flex-1 py-3 font-bold gap-2 text-foreground">
                                        <Mail size={14} /> {t.title}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        <Tabs value={editorMode} onValueChange={(val: any) => setEditorMode(val)} className="w-full">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Editor Type</Label>
                                <TabsList className="bg-secondary/20 border border-border h-8 p-1">
                                    <TabsTrigger value="visual" className="text-[10px] px-3 h-6 gap-1 text-foreground"><Sparkles size={10} /> Visual</TabsTrigger>
                                    <TabsTrigger value="code" className="text-[10px] px-3 h-6 gap-1 text-foreground"><Code size={10} /> Code</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="visual" className="mt-0 space-y-6">
                                <Card className="bg-secondary/5 border-border">
                                    <CardHeader className="bg-secondary/10 border-b border-border py-3">
                                        <CardTitle className="text-sm text-foreground flex items-center gap-2">
                                            <Layout size={14} /> Structure & Content
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground">Badge Text</Label>
                                                <Input 
                                                    value={visualFields.badge} 
                                                    onChange={(e) => setVisualFields(f => ({ ...f, badge: e.target.value }))}
                                                    className="bg-background border-border h-9 text-foreground"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground">Button Label</Label>
                                                <Input 
                                                    value={visualFields.buttonText} 
                                                    onChange={(e) => setVisualFields(f => ({ ...f, buttonText: e.target.value }))}
                                                    className="bg-background border-border h-9 text-foreground"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Email Headline</Label>
                                            <Input 
                                                value={visualFields.title} 
                                                onChange={(e) => setVisualFields(f => ({ ...f, title: e.target.value }))}
                                                className="bg-background border-border text-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Introductory Text</Label>
                                            <Textarea 
                                                value={visualFields.intro} 
                                                onChange={(e) => setVisualFields(f => ({ ...f, intro: e.target.value }))}
                                                className="bg-background border-border h-20 text-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-muted-foreground">Main Content Body</Label>
                                                <div className="flex gap-2">
                                                    {variablePalette.map(v => (
                                                        <button 
                                                            key={v.label}
                                                            onClick={() => insertVariable(v.value)}
                                                            className="text-[9px] bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20 transition-all font-bold"
                                                        >
                                                            + {v.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <Textarea 
                                                value={visualFields.body} 
                                                onChange={(e) => setVisualFields(f => ({ ...f, body: e.target.value }))}
                                                className="bg-background border-border h-48 font-mono text-xs leading-relaxed text-foreground"
                                                placeholder="Write your email content here. Use the buttons above to insert data variables."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="code" className="mt-0">
                                <Card className="bg-background border-border overflow-hidden h-full">
                                    <CardHeader className="bg-secondary/10 border-b border-border py-3 flex flex-row items-center justify-between">
                                        <CardTitle className="text-sm text-foreground flex items-center gap-2">
                                            <Code size={14} /> Blade Template Editor
                                        </CardTitle>
                                        <div className="flex gap-1.5">
                                            {variablePalette.map(v => (
                                                <button 
                                                    key={v.label}
                                                    onClick={() => insertVariable(v.value)}
                                                    className="text-[8px] bg-secondary hover:bg-secondary/80 text-muted-foreground px-1.5 py-0.5 rounded border border-border"
                                                >
                                                    {v.label}
                                                </button>
                                            ))}
                                        </div>
                                    </CardHeader>
                                    <textarea
                                        value={formValues[activeTemplate === 'admin_notification' ? 'email_template_admin' : 'email_template_user']}
                                        onChange={(e) => {
                                            const key = activeTemplate === 'admin_notification' ? 'email_template_admin' : 'email_template_user'
                                            setFormValues(prev => ({ ...prev, [key]: e.target.value }))
                                        }}
                                        className="w-full min-h-[500px] p-6 bg-[#010409] text-emerald-400 font-mono text-sm border-none focus:ring-0 resize-none leading-relaxed"
                                        placeholder="Type your Blade template here..."
                                    />
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Panel: Preview */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between py-2">
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Live Preview</Label>
                            {previewHtml && <span className="text-[10px] text-emerald-500 flex items-center gap-1"><CheckCircle2 size={10} /> Rendering Success</span>}
                        </div>
                        <Card className="bg-white border-border overflow-hidden h-full min-h-[700px] flex flex-col shadow-2xl">
                            {previewError && (
                                <div className="p-4 bg-red-500/10 text-red-600 text-sm flex items-start gap-3 border-b border-red-200">
                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <p>{previewError}</p>
                                </div>
                            )}
                            <div className="flex-1 bg-slate-100 relative">
                                {isPreviewLoading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 transition-all">
                                        <Loader2 size={32} className="animate-spin text-primary" />
                                    </div>
                                ) : null}
                                
                                {previewHtml ? (
                                    <iframe 
                                        srcDoc={previewHtml}
                                        className="w-full h-full min-h-[700px] border-none"
                                        title="Email Preview"
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                                        <div className="p-6 rounded-full bg-slate-50 mb-6">
                                            <Mail size={48} className="opacity-20" />
                                        </div>
                                        <h3 className="text-slate-600 font-bold mb-2">No Preview Generated</h3>
                                        <p className="text-sm max-w-xs">Update your content and click "Live Preview" to see how the email will appear to recipients.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default EmailSettingsPage
