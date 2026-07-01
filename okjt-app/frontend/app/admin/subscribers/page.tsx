"use client"

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Mail, User, Calendar } from 'lucide-react'
import { Subscriber } from '@/types/api'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { ResourceTableRow } from '@/components/admin/ResourceTableRow'
import { StatusBadge } from '@/components/admin/StatusBadge'

const sourceColors: Record<string, string> = {
    footer: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    form: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    admin: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    rsvp: 'bg-primary/10 text-primary border-primary/20',
}

const AdminSubscribersPage = () => {
    return (
        <AdminResourceTemplate<Subscriber>
            endpoint="/subscribers"
            resourceName="Subscriber"
            title="Subscribers"
            description="Manage your mailing list and track subscription sources."
            actionLabel="Add Subscriber"
            statusField="is_active"
            initialForm={{ email: '', name: '', source: 'footer', is_active: true } as Partial<Subscriber>}
            hideStatusFilter
            filterPlaceholder="Search by email, name, or source..."
            filterFn={(item, term) =>
                item.email.toLowerCase().includes(term.toLowerCase()) ||
                !!(item.name && item.name.toLowerCase().includes(term.toLowerCase())) ||
                !!(item.source && item.source.toLowerCase().includes(term.toLowerCase()))
            }
            sortOptions={[
                { label: 'Date', value: 'created_at' },
                { label: 'Email', value: 'email' },
                { label: 'Name', value: 'name' },
            ]}
            onValidate={(form) => {
                if (!form.email) return 'Email is required.'
                return null
            }}
            renderGridItem={(item, selectedIds, toggleSelect, onEdit, onDelete) => (
                <Card
                    key={item.id}
                    className="bg-secondary/5 border-border shadow-sm hover:bg-secondary/20 transition-all cursor-pointer"
                    onClick={() => onEdit(item)}
                >
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Mail size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg">{item.email}</h3>
                                    {item.source && (
                                        <Badge variant="outline" className={`text-[10px] px-1.5 h-4 ${sourceColors[item.source] || ''}`}>
                                            {item.source}
                                        </Badge>
                                    )}
                                    {!item.is_active && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 h-4 bg-slate-500/10 text-slate-500 border-slate-500/20">
                                            inactive
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <User size={14} /> {item.name || 'Anonymous'}
                                    </span>
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Calendar size={14} /> {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                        >
                            <Trash2 size={18} />
                        </Button>
                    </CardContent>
                </Card>
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
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Email</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Name</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Source</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Created</th>
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
                        <td className="p-4 font-medium">{item.email}</td>
                        <td className="p-4 text-muted-foreground">{item.name || '—'}</td>
                        <td className="p-4">
                            {item.source && (
                                <Badge variant="outline" className={`text-[10px] px-1.5 h-4 ${sourceColors[item.source] || ''}`}>
                                    {item.source}
                                </Badge>
                            )}
                        </td>
                        <td className="p-4">
                            <StatusBadge isActive={!!item.is_active} />
                        </td>
                        <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(item.created_at).toLocaleDateString()}
                        </td>
                    </ResourceTableRow>
                ))
            )}
            renderFormFields={(form, setForm) => (
                <>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
                        <Input
                            type="email"
                            value={(form as Subscriber).email || ''}
                            onChange={(e) => setForm({ ...form, email: e.target.value } as Partial<Subscriber>)}
                            placeholder="subscriber@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input
                            value={(form as Subscriber).name || ''}
                            onChange={(e) => setForm({ ...form, name: e.target.value } as Partial<Subscriber>)}
                            placeholder="Subscriber name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Source</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            value={(form as Subscriber).source || 'footer'}
                            onChange={(e) => setForm({ ...form, source: e.target.value } as Partial<Subscriber>)}
                        >
                            <option value="footer">Footer</option>
                            <option value="form">Form</option>
                            <option value="admin">Admin</option>
                            <option value="rsvp">RSVP</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Active</label>
                        <Switch
                            checked={(form as Subscriber).is_active ?? true}
                            onCheckedChange={(checked) => setForm({ ...form, is_active: checked } as Partial<Subscriber>)}
                        />
                    </div>
                </>
            )}
        />
    )
}

export default AdminSubscribersPage
