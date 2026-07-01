"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ArrowUpDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { renderFieldsFromConfig } from '@/components/admin/AdminResourceConfig'
import { statsConfig } from '@/components/admin/configs/stats.config'
import { Stat } from '@/types/api'

const AdminStatsPage = () => {
    const { endpoint, resourceName, title, description, actionLabel, initialForm, validate, filterFn, fields, ...configRest } = statsConfig

    return (
        <AdminResourceTemplate<Stat>
            endpoint={endpoint}
            resourceName={resourceName}
            title={title}
            description={description}
            actionLabel={actionLabel}
            initialForm={initialForm}
            filterFn={filterFn}
            onValidate={validate}
            {...configRest}
            renderGridItem={(stat, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <Card className="bg-secondary/5 border-border shadow-sm hover:bg-secondary/20 transition-all relative">
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
                            {stat.description && <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>}
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
                    {filteredStats?.map((stat) => (
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

            renderFormFields={(form, setForm) => renderFieldsFromConfig(fields, form as Record<string, any>, setForm as any)}
        />
    )
}

export default AdminStatsPage
