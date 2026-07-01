"use client"

import React from 'react'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { ResourceCard } from '@/components/admin/ResourceCard'
import { ResourceTableRow } from '@/components/admin/ResourceTableRow'
import { iconMap } from '@/components/admin/constants'
import { renderFieldsFromConfig } from '@/components/admin/AdminResourceConfig'
import { valuesConfig } from '@/components/admin/configs/values.config'
import { Value } from '@/types/api'

export default function AdminValuesPage() {
    const { endpoint, resourceName, title, description, actionLabel, initialForm, validate, filterFn, fields, ...configRest } = valuesConfig

    return (
        <AdminResourceTemplate<Value>
            endpoint={endpoint}
            resourceName={resourceName}
            title={title}
            description={description}
            actionLabel={actionLabel}
            sortOptions={[
                { label: 'Sort Order', value: 'order' },
                { label: 'Alphabetical', value: 'title' },
            ]}
            initialForm={initialForm}
            filterFn={filterFn}
            onValidate={validate}
            {...configRest}
            renderGridItem={(val, selectedIds, toggleSelect, handleEdit, handleDelete) => {
                const IconComp = val.icon ? (iconMap as any)[val.icon] || (iconMap as any).Shield : (iconMap as any).Shield

                return (
                    <ResourceCard
                        key={val.id}
                        item={val}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    >
                        <div className="p-6 flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary/10 text-primary border border-primary/20">
                                    <IconComp size={24} />
                                </div>
                                <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-1">#{val.order}</div>
                            </div>
                            <h3 className="font-bold text-lg mb-2">{val.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-3">{val.description}</p>
                        </div>
                    </ResourceCard>
                )
            }}

            renderTableHeaders={(filteredValues, selectedIds, selectAll) => (
                <tr>
                    <th className="p-4 px-6 w-10"><input type="checkbox" checked={selectedIds.length === filteredValues?.length && (filteredValues?.length || 0) > 0} onChange={() => selectAll(filteredValues?.map(i => i.id) || [])} className="rounded" /></th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Title</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground text-right flex-1">Description</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Order</th>
                    <th className="p-4 text-right pr-6 font-bold text-xs uppercase tracking-widest text-muted-foreground">Actions</th>
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

            renderFormFields={(formData, setFormData) => renderFieldsFromConfig(fields, formData as Record<string, any>, setFormData as any)}
        />
    )
}
