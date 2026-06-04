"use client"

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { cn } from '@/lib/utils'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Search, Download, RefreshCw, Rocket, Trash2, Mail, MoreVertical, LayoutGrid, List } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Rsvp } from '@/types/api'

export default function AdminRsvpsPage() {
    const { data: rsvps, isLoading, mutate } = useApi<Rsvp[]>('/rsvps')
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [attendanceFilter, setAttendanceFilter] = useState<string>('all')

    const typeColors: Record<string, string> = {
        rsvp: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        early_access: 'bg-primary/10 text-primary border-primary/20',
    }

    const attendanceColors: Record<string, string> = {
        accept: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        decline: 'bg-destructive/10 text-destructive border-destructive/20',
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Permanently delete this RSVP?')) return
        try {
            await api.delete(`/rsvps/${id}`)
            toast({ title: "Deleted", description: "RSVP removed successfully." })
            mutate()
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete RSVP." })
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} RSVPs?`)) return
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/rsvps/${id}`)))
            toast({ title: "Success", description: "Selected RSVPs deleted." })
            setSelectedIds([])
            mutate()
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Bulk action failed." })
        }
    }

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const filteredRsvps = rsvps?.filter(rsvp => {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
            rsvp.name.toLowerCase().includes(query) || 
            rsvp.email.toLowerCase().includes(query) ||
            (rsvp.company && rsvp.company.toLowerCase().includes(query)) ||
            (rsvp.job_title && rsvp.job_title.toLowerCase().includes(query))

        const matchesType = typeFilter === 'all' || rsvp.type === typeFilter
        const matchesAttendance = attendanceFilter === 'all' || rsvp.attendance === attendanceFilter

        return matchesSearch && matchesType && matchesAttendance
    })

    const handleExport = () => {
        if (!rsvps) return
        
        const headers = ['Type', 'Attendance', 'Name', 'Email', 'Organization', 'Role', 'Sector', 'Interest', 'Newsletter', 'Date Registered']
        const csvContent = [
            headers.join(','),
            ...rsvps.map(r => [
                `"${r.type === 'rsvp' ? 'Dinner RSVP' : 'Early Access'}"`,
                `"${r.type === 'rsvp' ? (r.attendance || 'Pending') : 'N/A'}"`,
                `"${r.name}"`,
                `"${r.email}"`,
                `"${r.company || ''}"`,
                `"${r.job_title || ''}"`,
                `"${r.sector || ''}"`,
                `"${r.interest || ''}"`,
                `"${r.newsletter ? 'Yes' : 'No'}"`,
                `"${format(new Date(r.created_at), 'yyyy-MM-dd HH:mm')}"`
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `okjtech-launch-rsvps-${format(new Date(), 'yyyy-MM-dd')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <AdminLayout>
            <div className="space-y-8 font-inter">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
                            <Rocket className="text-primary h-8 w-8" />
                            Launch RSVPs
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage RSVP and early access registrations for the platform launch.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => mutate()} disabled={isLoading} className="gap-2">
                            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                            Refresh
                        </Button>
                        <Button onClick={handleExport} disabled={!rsvps?.length} className="gap-2">
                            <Download size={16} />
                            Export CSV
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-secondary/10 p-4 border border-border/50 rounded-lg">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input 
                                placeholder="Search RSVPs..." 
                                className="pl-10 bg-background/50 border-border/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex bg-secondary/20 p-1 rounded-lg border border-border/50">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                                        Type: {typeFilter === 'all' ? 'All' : typeFilter === 'rsvp' ? 'Dinner' : 'Early Access'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setTypeFilter('all')}>All Types</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTypeFilter('rsvp')}>Dinner RSVP</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTypeFilter('early_access')}>Early Access</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <hr className="mx-1 border-white/10 h-6 my-auto" />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                                        Attendance: {attendanceFilter === 'all' ? 'All' : attendanceFilter === 'accept' ? 'Accept' : 'Decline'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setAttendanceFilter('all')}>All Attendance</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setAttendanceFilter('accept')}>Accepted</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setAttendanceFilter('decline')}>Declined</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-4 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                                <span className="text-sm font-medium text-primary">{selectedIds.length} selected</span>
                                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Delete Selected</Button>
                            </div>
                        )}

                        <div className="flex bg-secondary/20 p-1 rounded-lg border border-border/50">
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

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-secondary/20 animate-pulse rounded-lg" />)}
                    </div>
                ) : (
                    <>
                        {viewMode === 'list' ? (
                            <div className="bg-secondary/10 border border-border/50 overflow-hidden rounded-lg">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-secondary/20 border-b border-border/50">
                                            <tr>
                                                <th className="p-4 px-6 w-10">
                                                    <Checkbox 
                                                        checked={selectedIds.length === filteredRsvps?.length && filteredRsvps?.length > 0}
                                                        onCheckedChange={(checked: boolean) => {
                                                            if (checked) setSelectedIds(filteredRsvps?.map(r => r.id) || [])
                                                            else setSelectedIds([])
                                                        }}
                                                    />
                                                </th>
                                                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Type</th>
                                                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Name / Attendance</th>
                                                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Email</th>
                                                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground hidden md:table-cell">Organization</th>
                                                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Role</th>
                                                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground hidden xl:table-cell">Sector/Interest</th>
                                                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground text-right">Registered</th>
                                                <th className="p-4 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50 font-inter">
                                            {filteredRsvps?.map((rsvp) => (
                                                <tr key={rsvp.id} className="hover:bg-primary/5 transition-colors group">
                                                    <td className="p-4 px-6">
                                                        <Checkbox 
                                                            checked={selectedIds.includes(rsvp.id)}
                                                            onCheckedChange={() => toggleSelect(rsvp.id)}
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant="outline" className={typeColors[rsvp.type]}>
                                                            {rsvp.type === 'rsvp' ? 'Dinner' : 'Access'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-foreground">{rsvp.name}</div>
                                                        {rsvp.type === 'rsvp' && rsvp.attendance && (
                                                            <div className="text-[10px] mt-0.5">
                                                                <Badge variant="outline" className={cn("text-[9px] font-bold px-1 py-0 h-4 uppercase", attendanceColors[rsvp.attendance])}>
                                                                    {rsvp.attendance === 'accept' ? '• Accepted' : '• Declined'}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <a href={`mailto:${rsvp.email}`} className="text-sm text-primary hover:underline underline-offset-4 flex items-center gap-1.5">
                                                            <Mail size={12} /> {rsvp.email}
                                                        </a>
                                                    </td>
                                                    <td className="p-4 text-muted-foreground hidden md:table-cell text-sm">{rsvp.company || '-'}</td>
                                                    <td className="p-4 text-muted-foreground hidden lg:table-cell text-sm">{rsvp.job_title || '-'}</td>
                                                    <td className="p-4 text-muted-foreground hidden xl:table-cell text-sm">
                                                        <div className="flex flex-col">
                                                            <span className="capitalize">{rsvp.sector || '-'}</span>
                                                            <span className="text-[10px] text-muted-foreground capitalize">
                                                                {rsvp.interest ? rsvp.interest.replace(/_/g, ' ') : '-'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right text-muted-foreground whitespace-nowrap text-xs">
                                                        {format(new Date(rsvp.created_at), 'MMM dd, yyyy')}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm"><MoreVertical size={16} /></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleDelete(rsvp.id)} className="text-destructive">
                                                                    <Trash2 size={14} className="mr-2" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRsvps?.map((rsvp) => (
                                    <div key={rsvp.id} className="bg-secondary/10 border border-border/50 p-6 space-y-4 hover:border-primary/40 transition-all group relative rounded-lg">
                                        <Checkbox 
                                            checked={selectedIds.includes(rsvp.id)}
                                            onCheckedChange={() => toggleSelect(rsvp.id)}
                                            className="absolute top-4 left-4"
                                        />
                                        <div className="absolute top-4 right-4 text-xs text-muted-foreground">
                                            {format(new Date(rsvp.created_at), 'MMM dd')}
                                        </div>
                                        
                                        <div className="flex items-center gap-3 pt-4">
                                            <div className="flex flex-col">
                                                <div className="font-bold text-lg">{rsvp.name}</div>
                                                <div className="flex gap-1.5 mt-1">
                                                    <Badge variant="outline" className={cn("text-[10px] px-1.5 h-4", typeColors[rsvp.type])}>
                                                        {rsvp.type === 'rsvp' ? 'Dinner' : 'Early Access'}
                                                    </Badge>
                                                    {rsvp.type === 'rsvp' && rsvp.attendance && (
                                                        <Badge variant="outline" className={cn("text-[10px] px-1.5 h-4", attendanceColors[rsvp.attendance])}>
                                                            {rsvp.attendance === 'accept' ? 'Accepted' : 'Declined'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-background/30 rounded border border-white/5 space-y-2 text-sm text-muted-foreground">
                                            <div><span className="font-medium text-foreground">Organization:</span> {rsvp.company || '-'}</div>
                                            <div><span className="font-medium text-foreground">Role:</span> {rsvp.job_title || '-'}</div>
                                            <div><span className="font-medium text-foreground">Sector:</span> <span className="capitalize">{rsvp.sector || '-'}</span></div>
                                            <div><span className="font-medium text-foreground">Interest:</span> <span className="capitalize">{rsvp.interest ? rsvp.interest.replace(/_/g, ' ') : '-'}</span></div>
                                            <div><span className="font-medium text-foreground">Newsletter:</span> {rsvp.newsletter ? 'Yes' : 'No'}</div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <a href={`mailto:${rsvp.email}`} className="text-xs text-primary hover:underline font-bold flex items-center gap-1.5">
                                                <Mail size={14} /> Reply
                                            </a>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(rsvp.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2">
                                                <Trash2 size={14} className="mr-1" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {filteredRsvps?.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-lg">
                                <p className="text-muted-foreground">No launch RSVPs found.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    )
}
