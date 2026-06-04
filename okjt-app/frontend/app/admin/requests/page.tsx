"use client"

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Search, Mail, User, Clock, CheckCircle2, Archive, Trash2, MoreVertical, LayoutGrid, List } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from '@/lib/utils'

import { ConsultationRequest } from '@/types/api'

export default function AdminRequestsPage() {
    const { data: requests, mutate, isLoading } = useApi<ConsultationRequest[]>('/consultation-requests')
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'created_at' | 'status'>('created_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        contacted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        resolved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        archived: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    }

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/consultation-requests/${id}`, { status })
            toast({ title: "Updated", description: `Request marked as ${status}.` })
            mutate()
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update status." })
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Permanently delete this request?')) return
        try {
            await api.delete(`/consultation-requests/${id}`)
            toast({ title: "Deleted", description: "Request removed." })
            mutate()
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete." })
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} requests?`)) return
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/consultation-requests/${id}`)))
            toast({ title: "Success", description: "Items deleted." })
            setSelectedIds([])
            mutate()
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Bulk action failed." })
        }
    }

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const filteredRequests = requests?.filter(r => {
        const matchesSearch = 
            r.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            r.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.subject?.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter
        
        return matchesSearch && matchesStatus
    }).sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1
        if (sortBy === 'status') return a.status.localeCompare(b.status) * factor
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * factor
    })

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Consultation Requests</h1>
                        <p className="text-muted-foreground">Manage leads and inquiries from the contact form.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-secondary/20 p-1 rounded-lg border border-border/50">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                                        Filter: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('contacted')}>Contacted</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('resolved')}>Resolved</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('archived')}>Archived</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <hr className="mx-1 border-white/10 h-6 my-auto" />
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                                        Sort: {sortBy === 'created_at' ? 'Date' : 'Status'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSortBy('created_at')}>Sort by Date</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('status')}>Sort by Status</DropdownMenuItem>
                                    <hr className="my-1 border-white/10" />
                                    <DropdownMenuItem onClick={() => setSortOrder('asc')}>Ascending</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortOrder('desc')}>Descending</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        
                        <div className="flex bg-secondary/20 p-1 rounded-lg border border-border/50 font-inter">
                            <Button 
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid size={16} />
                            </Button>
                            <Button 
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => setViewMode('list')}
                            >
                                <List size={16} />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-secondary/10 p-4 border border-border/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input 
                            placeholder="Search requests..." 
                            className="pl-10 bg-background/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-4 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                            <span className="text-sm font-medium text-primary">{selectedIds.length} selected</span>
                            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Delete Selected</Button>
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-secondary/20 animate-pulse" />)}
                    </div>
                ) : (
                    <>
                        {viewMode === 'list' ? (
                            <div className="bg-secondary/10 border border-border/50 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-secondary/20 border-b border-border/50">
                                        <tr>
                                            <th className="p-4 px-6 w-10">
                                                <Checkbox 
                                                    checked={selectedIds.length === filteredRequests?.length && filteredRequests?.length > 0}
                                                    onCheckedChange={(checked: boolean) => {
                                                        if (checked) setSelectedIds(filteredRequests?.map(r => r.id) || [])
                                                        else setSelectedIds([])
                                                    }}
                                                />
                                            </th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Sender</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Subject & Message</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Date</th>
                                            <th className="p-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50 font-inter">
                                        {filteredRequests?.map((req) => (
                                            <tr key={req.id} className="hover:bg-primary/5 transition-colors group">
                                                <td className="p-4 px-6">
                                                    <Checkbox 
                                                        checked={selectedIds.includes(req.id)}
                                                        onCheckedChange={() => toggleSelect(req.id)}
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-foreground">{req.first_name} {req.last_name}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                        <Mail size={12} /> {req.email}
                                                    </div>
                                                </td>
                                                <td className="p-4 max-w-md">
                                                    <div className="font-semibold text-sm mb-1">{req.subject}</div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">{req.message}</p>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className={statusColors[req.status]}>
                                                        {req.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-xs text-muted-foreground">
                                                    {format(new Date(req.created_at), 'MMM dd, yyyy HH:mm')}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm"><MoreVertical size={16} /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, 'contacted')}>Mark as Contacted</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, 'resolved')}>Mark as Resolved</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, 'archived')}>Archive</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDelete(req.id)} className="text-destructive">Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRequests?.map((req) => (
                                    <div key={req.id} className="bg-secondary/10 border border-border/50 p-6 space-y-4 hover:border-primary/40 transition-all group relative">
                                        <Checkbox 
                                            checked={selectedIds.includes(req.id)}
                                            onCheckedChange={() => toggleSelect(req.id)}
                                            className="absolute top-4 left-4"
                                        />
                                        <div className="absolute top-4 right-4 text-xs text-muted-foreground">
                                            {format(new Date(req.created_at), 'MMM dd')}
                                        </div>
                                        
                                        <div className="flex items-center gap-3 pt-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold">{req.first_name} {req.last_name}</div>
                                                <Badge variant="outline" className={cn("text-[10px] px-1.5 h-4", statusColors[req.status])}>
                                                    {req.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-background/30 rounded border border-white/5 space-y-2">
                                            <div className="text-sm font-bold text-primary">{req.subject}</div>
                                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{req.message}</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <a href={`mailto:${req.email}`} className="text-xs text-primary hover:underline font-bold flex items-center gap-1.5">
                                                <Mail size={14} /> Reply
                                            </a>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">Manage <MoreVertical size={14} className="ml-1" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, 'contacted')}>Mark Contacted</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, 'resolved')}>Mark Resolved</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(req.id)} className="text-destructive">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {filteredRequests?.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-border/50">
                                <p className="text-muted-foreground">No consultation requests found.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    )
}
