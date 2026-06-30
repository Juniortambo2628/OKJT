"use client"

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Trash2, Mail, MoreVertical } from 'lucide-react'
import { Rsvp } from '@/types/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { ResourceTableRow } from '@/components/admin/ResourceTableRow'

const typeColors: Record<string, string> = {
    rsvp: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    early_access: 'bg-primary/10 text-primary border-primary/20',
}

const attendanceColors: Record<string, string> = {
    accept: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    decline: 'bg-destructive/10 text-destructive border-destructive/20',
}

export default function AdminRsvpsPage() {
    return (
        <AdminResourceTemplate<Rsvp>
            endpoint="/rsvps"
            resourceName="Rsvp"
            title="RSVPs & Early Access"
            description="Manage RSVP and early access registrations."
            actionLabel="Add RSVP"
            statusField="type"
            initialForm={{ name: '', email: '', company: '', job_title: '', sector: '', interest: '', consent: false, newsletter: false, type: 'early_access', attendance: null } as Partial<Rsvp>}
            hideStatusFilter
            filterPlaceholder="Search by name, email, or company..."
            filterFn={(item, term) =>
                item.name.toLowerCase().includes(term.toLowerCase()) ||
                item.email.toLowerCase().includes(term.toLowerCase()) ||
                !!(item.company && item.company.toLowerCase().includes(term.toLowerCase()))
            }
            sortOptions={[
                { label: 'Date', value: 'created_at' },
                { label: 'Name', value: 'name' },
                { label: 'Type', value: 'type' },
            ]}
            onValidate={(form) => {
                const f = form as Partial<Rsvp>
                if (!f.name) return 'Name is required.'
                if (!f.email) return 'Email is required.'
                return null
            }}
            renderGridItem={(item, selectedIds, toggleSelect, onEdit, onDelete) => (
                <div
                    key={item.id}
                    className="bg-secondary/10 border border-border/50 p-6 space-y-4 hover:border-primary/40 transition-all group relative cursor-pointer"
                    onClick={() => onEdit(item)}
                >
                    <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                        className="absolute top-4 left-4"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute top-4 right-4 text-xs text-muted-foreground">
                        {format(new Date(item.created_at), 'MMM dd')}
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <div className="flex flex-col">
                            <div className="font-bold text-lg">{item.name}</div>
                            <div className="flex gap-1.5 mt-1">
                                <Badge variant="outline" className={cn("text-[10px] px-1.5 h-4", typeColors[item.type])}>
                                    {item.type === 'rsvp' ? 'Dinner' : 'Early Access'}
                                </Badge>
                                {item.type === 'rsvp' && item.attendance && (
                                    <Badge variant="outline" className={cn("text-[10px] px-1.5 h-4", attendanceColors[item.attendance])}>
                                        {item.attendance === 'accept' ? 'Accepted' : 'Declined'}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-background/30 rounded border border-white/5 space-y-2 text-sm text-muted-foreground">
                        <div><span className="font-medium text-foreground">Email:</span> {item.email}</div>
                        <div><span className="font-medium text-foreground">Company:</span> {item.company || '-'}</div>
                        <div><span className="font-medium text-foreground">Sector:</span> <span className="capitalize">{item.sector || '-'}</span></div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <a href={`mailto:${item.email}`} className="text-xs text-primary hover:underline font-bold flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Mail size={14} /> Reply
                        </a>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(item.id) }} className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2">
                            <Trash2 size={14} className="mr-1" /> Delete
                        </Button>
                    </div>
                </div>
            )}
            renderTableHeaders={(items, selectedIds, selectAll) => (
                <tr>
                    <th className="p-4 px-6 w-10">
                        <Checkbox
                            checked={selectedIds.length === items.length && items.length > 0}
                            onCheckedChange={(checked: boolean) => {
                                if (checked) selectAll(items.map(i => i.id))
                                else selectAll([])
                            }}
                        />
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Name</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Email</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Company</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Type</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Attendance</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground text-right">Registered</th>
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
                        <td className="p-4 font-bold text-foreground">{item.name}</td>
                        <td className="p-4">
                            <a href={`mailto:${item.email}`} className="text-sm text-primary hover:underline underline-offset-4 flex items-center gap-1.5">
                                <Mail size={12} /> {item.email}
                            </a>
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">{item.company || '—'}</td>
                        <td className="p-4">
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 h-4", typeColors[item.type])}>
                                {item.type === 'rsvp' ? 'Dinner' : 'Early Access'}
                            </Badge>
                        </td>
                        <td className="p-4">
                            {item.attendance ? (
                                <Badge variant="outline" className={cn("text-[10px] px-1.5 h-4", attendanceColors[item.attendance])}>
                                    {item.attendance === 'accept' ? 'Accepted' : 'Declined'}
                                </Badge>
                            ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                            )}
                        </td>
                        <td className="p-4 text-right text-muted-foreground whitespace-nowrap text-xs">
                            {format(new Date(item.created_at), 'MMM dd, yyyy')}
                        </td>
                    </ResourceTableRow>
                ))
            )}
            renderFormFields={(form, setForm) => (
                <>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
                        <Input
                            value={(form as Rsvp).name || ''}
                            onChange={(e) => setForm({ ...form, name: e.target.value } as Partial<Rsvp>)}
                            placeholder="Full name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
                        <Input
                            type="email"
                            value={(form as Rsvp).email || ''}
                            onChange={(e) => setForm({ ...form, email: e.target.value } as Partial<Rsvp>)}
                            placeholder="email@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Company</label>
                        <Input
                            value={(form as Rsvp).company || ''}
                            onChange={(e) => setForm({ ...form, company: e.target.value } as Partial<Rsvp>)}
                            placeholder="Company name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Job Title</label>
                        <Input
                            value={(form as Rsvp).job_title || ''}
                            onChange={(e) => setForm({ ...form, job_title: e.target.value } as Partial<Rsvp>)}
                            placeholder="Job title"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sector</label>
                        <Input
                            value={(form as Rsvp).sector || ''}
                            onChange={(e) => setForm({ ...form, sector: e.target.value } as Partial<Rsvp>)}
                            placeholder="Industry sector"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Interest</label>
                        <Input
                            value={(form as Rsvp).interest || ''}
                            onChange={(e) => setForm({ ...form, interest: e.target.value } as Partial<Rsvp>)}
                            placeholder="Area of interest"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            value={(form as Rsvp).type || 'early_access'}
                            onChange={(e) => setForm({ ...form, type: e.target.value as Rsvp['type'] } as Partial<Rsvp>)}
                        >
                            <option value="early_access">Early Access</option>
                            <option value="rsvp">RSVP</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Attendance</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            value={(form as Rsvp).attendance ?? ''}
                            onChange={(e) => setForm({ ...form, attendance: e.target.value === '' ? null : e.target.value as Rsvp['attendance'] } as Partial<Rsvp>)}
                        >
                            <option value="">Not set</option>
                            <option value="accept">Accept</option>
                            <option value="decline">Decline</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Consent</label>
                        <Switch
                            checked={(form as Rsvp).consent ?? false}
                            onCheckedChange={(checked) => setForm({ ...form, consent: checked } as Partial<Rsvp>)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Newsletter</label>
                        <Switch
                            checked={(form as Rsvp).newsletter ?? false}
                            onCheckedChange={(checked) => setForm({ ...form, newsletter: checked } as Partial<Rsvp>)}
                        />
                    </div>
                </>
            )}
        />
    )
}
