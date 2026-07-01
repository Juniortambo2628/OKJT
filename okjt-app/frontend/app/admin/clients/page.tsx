"use client"

import React from 'react'
import { Building2, ExternalLink } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { ResourceCard } from '@/components/admin/ResourceCard'
import { ResourceTableRow } from '@/components/admin/ResourceTableRow'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { renderFieldsFromConfig } from '@/components/admin/AdminResourceConfig'
import { clientsConfig } from '@/components/admin/configs/clients.config'
import { Client } from '@/types/api'

const AdminClientsPage = () => {
    const { endpoint, resourceName, title, description, actionLabel, initialForm, validate, filterFn, fields, ...configRest } = clientsConfig

    return (
        <AdminResourceTemplate<Client>
            endpoint={endpoint}
            resourceName={resourceName}
            title={title}
            description={description}
            actionLabel={actionLabel}
            initialForm={initialForm}
            filterFn={filterFn}
            onValidate={validate}
            {...configRest}
            renderGridItem={(client, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <ResourceCard
                    item={client}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                >
                    <div className="p-5 pt-10">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${client.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {client.order}
                            </div>
                        </div>
                        {client.logo ? (
                            <img src={client.logo} alt={client.name} className="h-8 object-contain mb-3 opacity-70" />
                        ) : (
                            <div className="h-8 mb-3 flex items-center">
                                <Building2 size={24} className="text-muted-foreground" />
                            </div>
                        )}
                        <h3 className="font-bold text-sm">{client.name}</h3>
                        {client.website && (
                            <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1">
                                <ExternalLink size={10} /> Website
                            </a>
                        )}
                    </div>
                </ResourceCard>
            )}

            renderTableHeaders={(filteredClients, selectedIds, selectAll) => (
                <tr>
                    <th className="p-4 px-6 w-10">
                        <Checkbox
                            checked={selectedIds.length === filteredClients?.length && filteredClients?.length > 0}
                            onCheckedChange={() => selectAll(filteredClients?.map(i => i.id) || [])}
                        />
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Client</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Website</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Order</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="p-4 text-right pr-6"></th>
                </tr>
            )}

            renderTableRows={(filteredClients, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <>
                    {filteredClients?.map((client) => (
                        <ResourceTableRow
                            key={client.id}
                            item={client}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleSelect}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        >
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    {client.logo ? (
                                        <img src={client.logo} alt={client.name} className="h-6 w-10 object-contain opacity-70" />
                                    ) : (
                                        <div className="h-6 w-10 flex items-center justify-center bg-primary/10 rounded">
                                            <Building2 size={12} className="text-primary" />
                                        </div>
                                    )}
                                    <div className="font-bold text-sm">{client.name}</div>
                                </div>
                            </td>
                            <td className="p-4 text-xs text-muted-foreground max-w-md truncate">
                                {client.website ? (
                                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1">
                                        {client.website} <ExternalLink size={10} />
                                    </a>
                                ) : '—'}
                            </td>
                            <td className="p-4 text-xs text-muted-foreground">
                                {client.order}
                            </td>
                            <td className="p-4">
                                <StatusBadge isActive={!!client.is_active} />
                            </td>
                        </ResourceTableRow>
                    ))}
                </>
            )}

            renderFormFields={(form, setForm) => renderFieldsFromConfig(fields, form as Record<string, any>, setForm as any)}
        />
    )
}

export default AdminClientsPage
