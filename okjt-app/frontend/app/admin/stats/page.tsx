"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'

const AdminStatsPage = () => {
    return (
        <AdminResourceTemplate<any>
            endpoint="/stats"
            resourceName="Stat"
            title="Key Statistics"
            description="Manage the performance metrics shown on the landing page."
            actionLabel="Add Stat"
            statusField="is_active"
            gridColsClass="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            initialForm={{
                label: '',
                value: '',
                order: 0,
                icon: '',
                is_active: true,
            }}
            filterFn={(s, term) => 
                (s.label || '').toLowerCase().includes(term.toLowerCase()) ||
                (s.value || '').toLowerCase().includes(term.toLowerCase())
            }
            onValidate={(form) => {
                if (!form.value || !form.label) return "Value and Label are required"
                return null
            }}
            
            renderGridItem={(stat, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <Card className="bg-secondary/10 border-border/50 hover:bg-secondary/20 transition-all relative">
                    <div className="absolute top-4 left-4 z-10">
                        <Checkbox
                            checked={selectedIds.includes(stat.id)}
                            onCheckedChange={() => toggleSelect(stat.id)}
                            className="border-border bg-background/50"
                        />
                    </div>
                    <CardContent className="p-6 pt-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {stat.order}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(stat)}>
                                    <Pencil size={14} />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(stat.id)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold tracking-tight text-primary">{stat.value}</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <ArrowUpDown size={12} />
                                Sort order: {stat.order}
                            </div>
                            <div className="flex items-center gap-1">
                                Icon: {stat.icon || 'default'}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            renderTableHeaders={(filteredStats, selectedIds, selectAll) => (
                <tr>
                    <th className="p-4 px-6 w-10">
                        <Checkbox
                            checked={selectedIds.length === filteredStats?.length && filteredStats?.length > 0}
                            onCheckedChange={() => selectAll(filteredStats?.map(i => i.id) || [])}
                        />
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Value</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Label</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Order</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Icon</th>
                    <th className="p-4 text-right pr-6"></th>
                </tr>
            )}

            renderTableRows={(filteredStats, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <>
                    {filteredStats?.map((stat: any) => (
                        <tr key={stat.id} className="hover:bg-primary/5 transition-colors group">
                            <td className="p-4 px-6">
                                <Checkbox
                                    checked={selectedIds.includes(stat.id)}
                                    onCheckedChange={() => toggleSelect(stat.id)}
                                    className="border-border"
                                />
                            </td>
                            <td className="p-4 font-bold text-sm text-primary">
                                {stat.value}
                            </td>
                            <td className="p-4 text-sm text-foreground">
                                {stat.label}
                            </td>
                            <td className="p-4 text-xs text-muted-foreground">
                                {stat.order}
                            </td>
                            <td className="p-4 text-xs text-muted-foreground">
                                {stat.icon || '—'}
                            </td>
                            <td className="p-4 text-right pr-6">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(stat)}><Pencil size={14} /></Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive/40 hover:text-destructive" onClick={() => handleDelete(stat.id)}><Trash2 size={14} /></Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </>
            )}

            renderFormFields={(form, setForm) => (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Value (e.g. 180 M)</label>
                            <Input placeholder="Stat Value" value={form.value || ''} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Label (e.g. PPA Portfolio)</label>
                            <Input placeholder="Stat Label" value={form.label || ''} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sort Order</label>
                            <Input type="number" value={form.order || 0} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Icon Name (Optional)</label>
                            <Input placeholder="e.g. Activity, Users" value={form.icon || ''} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
                        </div>
                    </div>
                </>
            )}
        />
    )
}

export default AdminStatsPage
