"use client"

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, MoreVertical } from 'lucide-react'
import { ConsultationRequest } from '@/types/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    contacted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    archived: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
}

export default function AdminRequestsPage() {
    return (
        <AdminResourceTemplate<ConsultationRequest>
            endpoint="/consultation-requests"
            resourceName="ConsultationRequest"
            title="Consultation Requests"
            description="Manage leads and inquiries from the contact form."
            actionLabel="New Request"
            statusField="status"
            initialForm={{ first_name: '', last_name: '', email: '', subject: '', message: '', status: 'pending' } as Partial<ConsultationRequest>}
            hideStatusFilter
            filterPlaceholder="Search by name, email, or subject..."
            filterFn={(item, term) =>
                item.first_name.toLowerCase().includes(term.toLowerCase()) ||
                item.last_name.toLowerCase().includes(term.toLowerCase()) ||
                item.email.toLowerCase().includes(term.toLowerCase()) ||
                !!(item.subject && item.subject.toLowerCase().includes(term.toLowerCase()))
            }
            sortOptions={[
                { label: 'Date', value: 'created_at' },
                { label: 'Status', value: 'status' },
            ]}
            onValidate={(form) => {
                const f = form as Partial<ConsultationRequest>
                if (!f.first_name) return 'First name is required.'
                if (!f.last_name) return 'Last name is required.'
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
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User size={20} />
                        </div>
                        <div>
                            <div className="font-bold">{item.first_name} {item.last_name}</div>
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 h-4", statusColors[item.status])}>
                                {item.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="p-4 bg-background/30 rounded border border-white/5 space-y-2">
                        <div className="text-sm font-bold text-primary">{item.subject}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{item.message}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <a href={`mailto:${item.email}`} className="text-xs text-primary hover:underline font-bold flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Mail size={14} /> Reply
                        </a>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>Manage <MoreVertical size={14} className="ml-1" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Sender</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Subject & Message</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Date</th>
                    <th className="p-4 text-right"></th>
                </tr>
            )}
            renderTableRows={(items, selectedIds, toggleSelect, onEdit, onDelete) => (
                items.map((item) => (
                    <tr key={item.id} className="hover:bg-primary/5 transition-colors group cursor-pointer" onClick={() => onEdit(item)}>
                        <td className="p-4 px-6" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                                checked={selectedIds.includes(item.id)}
                                onCheckedChange={() => toggleSelect(item.id)}
                            />
                        </td>
                        <td className="p-4">
                            <div className="font-bold text-foreground">{item.first_name} {item.last_name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Mail size={12} /> {item.email}
                            </div>
                        </td>
                        <td className="p-4 max-w-md">
                            <div className="font-semibold text-sm mb-1">{item.subject}</div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{item.message}</p>
                        </td>
                        <td className="p-4">
                            <Badge variant="outline" className={statusColors[item.status]}>
                                {item.status}
                            </Badge>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">
                            {format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm"><MoreVertical size={16} /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </td>
                    </tr>
                ))
            )}
            renderFormFields={(form, setForm) => (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">First Name <span className="text-destructive">*</span></label>
                            <Input
                                value={(form as ConsultationRequest).first_name || ''}
                                onChange={(e) => setForm({ ...form, first_name: e.target.value } as Partial<ConsultationRequest>)}
                                placeholder="First name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name <span className="text-destructive">*</span></label>
                            <Input
                                value={(form as ConsultationRequest).last_name || ''}
                                onChange={(e) => setForm({ ...form, last_name: e.target.value } as Partial<ConsultationRequest>)}
                                placeholder="Last name"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
                        <Input
                            type="email"
                            value={(form as ConsultationRequest).email || ''}
                            onChange={(e) => setForm({ ...form, email: e.target.value } as Partial<ConsultationRequest>)}
                            placeholder="email@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                            value={(form as ConsultationRequest).subject || ''}
                            onChange={(e) => setForm({ ...form, subject: e.target.value } as Partial<ConsultationRequest>)}
                            placeholder="Subject"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <textarea
                            className="flex min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            value={(form as ConsultationRequest).message || ''}
                            onChange={(e) => setForm({ ...form, message: e.target.value } as Partial<ConsultationRequest>)}
                            placeholder="Message content"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            value={(form as ConsultationRequest).status || 'pending'}
                            onChange={(e) => setForm({ ...form, status: e.target.value } as Partial<ConsultationRequest>)}
                        >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="resolved">Resolved</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </>
            )}
        />
    )
}
