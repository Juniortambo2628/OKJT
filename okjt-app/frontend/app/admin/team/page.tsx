"use client"

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Plus, Search, MoreVertical, Edit2, Trash2, Linkedin, User, GripVertical, List, LayoutGrid } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ImageUploader from '@/components/admin/ImageUploader'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

import { TeamMember } from '@/types/api'

export default function AdminTeamPage() {
    const { data: team, mutate, isLoading } = useApi<TeamMember[]>('/team-members')
    const { toast } = useToast()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [sortBy, setSortBy] = useState<'name' | 'order'>('order')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        bio: '',
        qualifications: '',
        linkedin: '',
        image: '',
        order: 0
    })

    const handleOpenDialog = (member: any = null) => {
        if (member) {
            setEditingMember(member)
            setFormData({
                name: member.name,
                role: member.role,
                bio: member.bio || '',
                qualifications: member.qualifications || '',
                linkedin: member.linkedin || '',
                image: member.image || '',
                order: member.order || 0
            })
        } else {
            setEditingMember(null)
            setFormData({
                name: '',
                role: '',
                bio: '',
                qualifications: '',
                linkedin: '',
                image: '',
                order: (team?.length || 0) + 1
            })
        }
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            if (editingMember) {
                await api.put(`/team-members/${editingMember.id}`, formData)
                toast({ title: "Updated", description: "Team member updated successfully." })
            } else {
                await api.post('/team-members', formData)
                toast({ title: "Created", description: "Team member added successfully." })
            }
            mutate()
            setIsDialogOpen(false)
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err.response?.data?.message || "Failed to save team member."
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this team member?')) return
        try {
            await api.delete(`/team-members/${id}`)
            toast({ title: "Deleted", description: "Team member removed." })
            mutate()
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete." })
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} members?`)) return
        try {
            // Sequential delete for now, or implement batch endpoint in backend
            await Promise.all(selectedIds.map(id => api.delete(`/team-members/${id}`)))
            toast({ title: "Success", description: `${selectedIds.length} members deleted.` })
            setSelectedIds([])
            mutate()
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to perform bulk delete." })
        }
    }

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const filteredTeam = team?.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.role.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1
        if (sortBy === 'name') return a.name.localeCompare(b.name) * factor
        return (a.order - b.order) * factor
    })

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                        <p className="text-muted-foreground">Manage the professionals leading OKJTech.</p>
                    </div>
                    <div className="flex items-center gap-3">
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
                        <div className="flex bg-secondary/20 p-1 rounded-lg border border-border/50">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                                        Sort: {sortBy === 'name' ? 'Name' : 'Order'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSortBy('name')}>Sort by Name</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('order')}>Sort by Order</DropdownMenuItem>
                                    <hr className="my-1 border-white/10" />
                                    <DropdownMenuItem onClick={() => setSortOrder('asc')}>Ascending</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortOrder('desc')}>Descending</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <Button onClick={() => handleOpenDialog()} className="gap-2">
                            <Plus size={18} /> Add Member
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-secondary/10 p-4 border border-border/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input 
                            placeholder="Search by name or role..." 
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-secondary/20 animate-pulse border border-border/50" />
                        ))}
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredTeam?.map((member) => (
                                    <div key={member.id} className="group relative bg-secondary/10 border border-border/50 hover:border-primary/40 transition-all p-6 text-center">
                                        <Checkbox 
                                            checked={selectedIds.includes(member.id)}
                                            onCheckedChange={() => toggleSelect(member.id)}
                                            className="absolute top-4 left-4 border-white/20"
                                        />
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical size={16} /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleOpenDialog(member)} className="gap-2">
                                                        <Edit2 size={14} /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(member.id)} className="gap-2 text-destructive">
                                                        <Trash2 size={14} /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 overflow-hidden border border-primary/20">
                                            {member.image ? (
                                                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User size={40} className="text-primary/40" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg">{member.name}</h3>
                                        <p className="text-primary text-xs font-bold uppercase tracking-wider mb-3">{member.role}</p>
                                        <p className="text-muted-foreground text-xs line-clamp-3 mb-4">{member.bio}</p>
                                        {member.linkedin && (
                                            <a href={member.linkedin} target="_blank" className="text-primary hover:underline flex items-center justify-center gap-1.5 text-xs font-bold">
                                                <Linkedin size={12} /> LinkedIn
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-secondary/10 border border-border/50 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-secondary/20 border-b border-border/50">
                                        <tr>
                                            <th className="p-4 px-6 w-10">
                                                <Checkbox 
                                                    checked={selectedIds.length === filteredTeam?.length && filteredTeam?.length > 0}
                                                    onCheckedChange={(checked: boolean) => {
                                                        if (checked) setSelectedIds(filteredTeam?.map(m => m.id) || [])
                                                        else setSelectedIds([])
                                                    }}
                                                    className="border-white/20"
                                                />
                                            </th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Member</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Role</th>
                                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredTeam?.map((member) => (
                                            <tr key={member.id} className="hover:bg-primary/5 transition-colors group">
                                                <td className="p-4 px-6">
                                                    <Checkbox 
                                                        checked={selectedIds.includes(member.id)}
                                                        onCheckedChange={() => toggleSelect(member.id)}
                                                        className="border-white/20"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden border border-primary/20 shrink-0">
                                                            {member.image ? <img src={member.image} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-2.5 text-primary/40" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{member.name}</div>
                                                            {member.linkedin && <div className="text-[10px] text-primary lowercase">{member.linkedin}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">{member.role}</span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(member)}><Edit2 size={14} /></Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)} className="text-destructive"><Trash2 size={14} /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {filteredTeam?.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-border/50">
                                <p className="text-muted-foreground">No team members found.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl bg-[#0a1128] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
                        <DialogDescription className="text-white/50">
                            Fill in the details for the team member profile.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input 
                                    className="bg-white/5 border-white/10" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Role / Title</Label>
                                <Input 
                                    className="bg-white/5 border-white/10"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Qualifications</Label>
                                <Input 
                                    placeholder="e.g. MBA, CFA" 
                                    className="bg-white/5 border-white/10"
                                    value={formData.qualifications}
                                    onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>LinkedIn URL</Label>
                                <Input 
                                    placeholder="https://linkedin.com/in/..." 
                                    className="bg-white/5 border-white/10"
                                    value={formData.linkedin}
                                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-4 text-white">
                            <ImageUploader 
                                label="Profile Photo"
                                value={formData.image}
                                onChange={(url) => setFormData({...formData, image: url})}
                                className="mb-4"
                            />
                            <div className="space-y-2">
                                <Label>Display Order</Label>
                                <Input 
                                    type="number"
                                    className="bg-white/5 border-white/10"
                                    value={formData.order}
                                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>
                        <div className="col-span-full space-y-2">
                            <Label>Short Bio</Label>
                            <Textarea 
                                className="bg-white/5 border-white/10 min-h-[120px]"
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Member'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
