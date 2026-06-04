"use client"

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Search, Mail, Calendar, User, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { Subscriber } from '@/types/api'
import { useToast } from '@/hooks/use-toast'

const AdminSubscribersPage = () => {
    const { data: subscribers, mutate, isLoading } = useApi<Subscriber[]>('/subscribers')
    const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to remove this subscriber?')) {
            try {
                await api.delete(`/subscribers/${id}`)
                toast({
                    title: "Deleted",
                    description: "Subscriber has been removed.",
                })
                mutate()
            } catch (err: any) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: err.response?.data?.message || 'Failed to delete subscriber',
                })
            }
        }
    }

    const filteredSubscribers = subscribers?.filter((s) => 
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )


    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Newsletter Subscribers</h1>
                        <p className="text-muted-foreground">Manage your mailing list and track subscription sources.</p>
                    </div>
                    <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                        <span className="text-sm font-bold text-primary">{subscribers?.length || 0} Total Subscribers</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input 
                            placeholder="Search by email or name..." 
                            className="pl-10 bg-secondary/5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-secondary/10 border border-border/50 rounded-xl animate-pulse" />
                        ))
                    ) : filteredSubscribers?.map((sub: Subscriber) => (
                        <Card key={sub.id} className="bg-secondary/10 border-border/50 hover:bg-secondary/20 transition-all">

                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{sub.email}</h3>
                                            {sub.source && (
                                                <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground uppercase tracking-widest font-bold">
                                                    Source: {sub.source}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <User size={14} /> {sub.name || 'Anonymous'}
                                            </span>
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Calendar size={14} /> {new Date(sub.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(sub.id)}
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {filteredSubscribers?.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed rounded-xl opacity-50">
                            No subscribers found.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminSubscribersPage
