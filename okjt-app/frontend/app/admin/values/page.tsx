"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { ResourceCard } from '@/components/admin/ResourceCard'
import { ResourceTableRow } from '@/components/admin/ResourceTableRow'
import { IconPicker } from '@/components/admin/IconPicker'
import { iconMap } from '@/components/admin/constants'
import { FormField } from '@/components/admin/core/FormField'
import { ADMIN_INPUT_CLASSES } from '@/lib/config'
import { Value } from '@/types/api'

export default function AdminValuesPage() {
    return (
        <AdminResourceTemplate<Value>
            endpoint="/values"
            resourceName="Value"
            title="Company Values"
            description="Manage the core values displayed on the About page."
            actionLabel="Add Value"
            initialSortBy="order"
            initialSortOrder="asc"
            hideStatusFilter
            gridColsClass="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            dialogSizeClass="max-w-md"
            sortOptions={[
                { label: 'Sort Order', value: 'order' },
                { label: 'Alphabetical', value: 'title' },
            ]}
            initialForm={{
                icon: 'Shield',
                title: '',
                description: '',
                order: 0,
            }}
            filterFn={(v, term) =>
                (v.title || '').toLowerCase().includes(term.toLowerCase()) ||
                (v.description || '').toLowerCase().includes(term.toLowerCase())
            }
            onValidate={(form) => {
                if (!form.title || !form.description) return 'Title and Description are required'
                return null
            }}
            renderGridItem={(val, selectedIds, toggleSelect, handleEdit, handleDelete) => {
                const IconComp = val.icon ? (iconMap as any)[val.icon] || (iconMap as any).Shield : (iconMap as any).Shield

                return (
                    <ResourceCard
                        item={val}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    >
                        <div className="p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-primary/10 text-primary border border-primary/20 ml-8">
                                    <IconComp size={24} />
                                </div>
                            </div>
                            <h3 className="font-bold text-lg mb-2">{val.title}</h3>
                            <p className="text-muted-foreground text-sm flex-1">{val.description}</p>
                            <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                Order: {val.order}
                            </div>
                        </div>
                    </ResourceCard>
                )
            }}
            renderTableHeaders={(filteredValues, selectedIds, selectAll) => (
                <tr>
                    <th className="p-4 px-6 w-10">
                        <Checkbox 
                            checked={selectedIds.length === filteredValues?.length && filteredValues?.length > 0}
                            onCheckedChange={(checked: boolean) => {
                                if (checked) selectAll(filteredValues?.map(v => v.id) || [])
                                else selectAll([])
                            }}
                            className="border-white/20"
                        />
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Title</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground text-right flex-1">Description</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Order</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                </tr>
            )}
            renderTableRows={(filteredValues, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <>
                    {filteredValues?.map((val) => {
                        const IconComp = val.icon ? (iconMap as any)[val.icon] || (iconMap as any).Shield : (iconMap as any).Shield

                        return (
                            <ResourceTableRow
                                key={val.id}
                                item={val}
                                selectedIds={selectedIds}
                                onToggleSelect={toggleSelect}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 text-primary border border-primary/20 shrink-0">
                                            <IconComp size={16} />
                                        </div>
                                        <div className="font-bold">{val.title}</div>
                                    </div>
                                </td>
                                <td className="p-4 text-xs text-muted-foreground max-w-xs">{val.description}</td>
                                <td className="p-4 text-xs font-bold text-primary">{val.order}</td>
                            </ResourceTableRow>
                        )
                    })}
                </>
            )}
            renderFormFields={(formData, setFormData) => (
                <>
                    <div className="space-y-2">
                        <Label>Icon</Label>
                        <IconPicker
                            selectedIcon={formData.icon || 'Shield'}
                            onSelect={(iconName) => setFormData({...formData, icon: iconName})}
                            icons={iconMap}
                        />
                    </div>
                    <FormField label="Title">
                        <Input 
                            className={ADMIN_INPUT_CLASSES}
                            value={formData.title || ''}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </FormField>
                    <FormField label="Description">
                        <Textarea 
                            className={`${ADMIN_INPUT_CLASSES} min-h-[100px]`}
                            value={formData.description || ''}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </FormField>
                    <FormField label="Display Order">
                        <Input 
                            type="number"
                            className={ADMIN_INPUT_CLASSES}
                            value={formData.order || 0}
                            onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                        />
                    </FormField>
                </>
            )}
        />
    )
}
