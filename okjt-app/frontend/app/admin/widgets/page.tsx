"use client"

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Save, RefreshCw, MessageCircle, Send, Bot, ExternalLink, Plus, Trash2, GripVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import api from '@/lib/api'
import { SiteSetting } from '@/types/api'
import { useToast } from '@/hooks/use-toast'
import ImageUploader from '@/components/admin/ImageUploader'


const AdminWidgetsPage = () => {
    const { data: settingsByGroup, mutate, isLoading } = useApi<Record<string, SiteSetting[]>>('/settings')
    const { toast } = useToast()
    const [localSettings, setLocalSettings] = useState<Record<string, string>>({})
    const [faqData, setFaqData] = useState<{keywords: string[], answer: string}[]>([])
    const [quickReplies, setQuickReplies] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState(false)

    // Sync local state when data loads
    useEffect(() => {
        if (settingsByGroup) {
            const flat: Record<string, string> = {}
            Object.values(settingsByGroup).flat().forEach((s) => {
                flat[s.key] = s.value || ''
                if (s.key === 'chatbot_faq_data') {
                    try { setFaqData(JSON.parse(s.value || '[]')) } catch (e) {}
                }
                if (s.key === 'chatbot_quick_replies') {
                    try { setQuickReplies(JSON.parse(s.value || '[]')) } catch (e) {}
                }
            })
            setLocalSettings(flat)
        }
    }, [settingsByGroup])

    const handleSave = async () => {
        if (!settingsByGroup) return
        
        setIsSaving(true)
        try {
            const allSettings = Object.values(settingsByGroup).flat()
            const settingsToUpdate = allSettings.map(s => {
                let val = localSettings[s.key] || ''
                if (s.key === 'chatbot_faq_data') val = JSON.stringify(faqData)
                if (s.key === 'chatbot_quick_replies') val = JSON.stringify(quickReplies)
                
                return {
                    key: s.key,
                    value: val,
                    type: s.type,
                    group: s.group
                }
            })

            await api.put('/settings/batch', { settings: settingsToUpdate })
            toast({
                title: "Settings Saved",
                description: "All configurations have been updated.",
            })
            mutate()
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err.response?.data?.message || err.message || 'Failed to save settings',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const updateSetting = (key: string, value: string) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }))
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Widget Management</h1>
                        <p className="text-muted-foreground text-sm">Configure OKJTech Assistant and WhatsApp integrations.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            className="bg-transparent border-border hover:bg-secondary/20 text-foreground" 
                            onClick={() => mutate()} 
                            disabled={isLoading}
                        >
                            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                        </Button>
                        <Button 
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                        >
                            {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                    {/* OKJTech Assistant Card */}
                    <Card className="bg-secondary/5 border-border overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                        <Bot size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-foreground">OKJTech Assistant</CardTitle>
                                        <CardDescription className="text-muted-foreground">AI-powered chatbot for your site.</CardDescription>
                                    </div>
                                </div>
                                <Switch 
                                    checked={localSettings.okjt_assistant_enabled === '1'}
                                    onCheckedChange={(checked) => updateSetting('okjt_assistant_enabled', checked ? '1' : '0')}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Assistant ID</Label>
                                <Input 
                                    value={localSettings.okjt_assistant_id || ''}
                                    onChange={(e) => updateSetting('okjt_assistant_id', e.target.value)}
                                    placeholder="cl-..."
                                    className="bg-background border-border text-foreground focus:border-primary/50"
                                />
                                <p className="text-[10px] text-muted-foreground">Connect your specialised AI assistant by providing its unique ID.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                <p className="text-xs text-orange-600 dark:text-orange-200/60 leading-relaxed">
                                    <strong>Note:</strong> Ensure the AI assistant is published and public to ensure it loads correctly on the frontend.
                                </p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <Label className="text-muted-foreground">Knowledge Base (FAQ)</Label>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-7 text-[10px] gap-1 bg-background border-border text-foreground"
                                        onClick={() => setFaqData([...faqData, { keywords: [], answer: 'New Answer' }])}
                                    >
                                        <Plus size={12} /> Add Entry
                                    </Button>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {faqData.map((faq, idx) => (
                                        <div key={idx} className="p-3 bg-secondary/5 border border-border rounded-lg space-y-2 relative group">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="absolute top-1 right-1 h-6 w-6 text-muted-foreground/20 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={() => setFaqData(faqData.filter((_, i) => i !== idx))}
                                            >
                                                <Trash2 size={12} />
                                            </Button>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Keywords (comma separated)</Label>
                                                <Input 
                                                    value={faq.keywords.join(', ')}
                                                    onChange={(e) => {
                                                        const newFaq = [...faqData]
                                                        newFaq[idx].keywords = e.target.value.split(',').map(k => k.trim())
                                                        setFaqData(newFaq)
                                                    }}
                                                    className="h-8 text-xs bg-background border-border"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Answer</Label>
                                                <textarea 
                                                    value={faq.answer}
                                                    onChange={(e) => {
                                                        const newFaq = [...faqData]
                                                        newFaq[idx].answer = e.target.value
                                                        setFaqData(newFaq)
                                                    }}
                                                    className="w-full text-xs bg-background border-border p-2 rounded outline-none focus:ring-1 focus:ring-primary/30 min-h-[60px] text-foreground"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <Label className="text-muted-foreground">Quick Replies</Label>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-7 text-[10px] gap-1 bg-background border-border text-foreground"
                                        onClick={() => setQuickReplies([...quickReplies, 'New Reply'])}
                                    >
                                        <Plus size={12} /> Add Reply
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {quickReplies.map((qr, idx) => (
                                        <div key={idx} className="flex gap-2 items-center group">
                                            <div className="text-muted-foreground/20"><GripVertical size={14} /></div>
                                            <Input 
                                                value={qr}
                                                onChange={(e) => {
                                                    const newQr = [...quickReplies]
                                                    newQr[idx] = e.target.value
                                                    setQuickReplies(newQr)
                                                }}
                                                className="h-8 text-xs bg-background border-border flex-1"
                                            />
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-muted-foreground/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={() => setQuickReplies(quickReplies.filter((_, i) => i !== idx))}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* WhatsApp Card */}
                    <Card className="bg-secondary/5 border-border overflow-hidden">
                        <CardHeader className="bg-emerald-500/5 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                        <MessageCircle size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-foreground">WhatsApp Floater</CardTitle>
                                        <CardDescription className="text-muted-foreground">Direct contact widget via WhatsApp.</CardDescription>
                                    </div>
                                </div>
                                <Switch 
                                    checked={localSettings.whatsapp_enabled === '1'}
                                    onCheckedChange={(checked) => updateSetting('whatsapp_enabled', checked ? '1' : '0')}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Phone Number (with Country Code)</Label>
                                <Input 
                                    value={localSettings.whatsapp_number || ''}
                                    onChange={(e) => updateSetting('whatsapp_number', e.target.value)}
                                    placeholder="+44..."
                                    className="bg-background border-border text-foreground focus:border-emerald-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Welcome Message</Label>
                                <Input 
                                    value={localSettings.whatsapp_message || ''}
                                    onChange={(e) => updateSetting('whatsapp_message', e.target.value)}
                                    placeholder="Hello, I have a question..."
                                    className="bg-background border-border text-foreground focus:border-emerald-500/50"
                                />
                                <p className="text-[10px] text-muted-foreground">This message will be pre-filled when a user clicks the button.</p>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-200/60">
                                    <Send size={14} />
                                    <span>Test your connection</span>
                                </div>
                                <a 
                                    href={`https://wa.me/${localSettings.whatsapp_number}?text=${encodeURIComponent(localSettings.whatsapp_message || '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                                >
                                    Open Link <ExternalLink size={10} />
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminWidgetsPage
