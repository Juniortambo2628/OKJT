"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import ImageUploader from '@/components/admin/ImageUploader'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { ResourceCard } from '@/components/admin/ResourceCard'
import { ResourceTableRow } from '@/components/admin/ResourceTableRow'
import { StatusBadge } from '@/components/admin/StatusBadge'

const AdminClientsPage = () => {
    return (
        <AdminResourceTemplate<any>
            endpoint="/clients"
            resourceName="Client"
            title="Client Logos"
            description="Manage the client logos displayed in the trust carousel."
            actionLabel="Add Client"
            statusField="is_active"
            initialForm={{
                name: '',
                logo: '',
                website: '',
                is_active: true,
                order: 0,
            }}
            filterFn={(c, term) => 
                (c.name || '').toLowerCase().includes(term.toLowerCase())
            }
            onValidate={(form) => {
                if (!form.name) return "Client Name is required"
                return null
            }}
            
            renderGridItem={(client, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <ResourceCard
                    item={client}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                >
                    <CardContent className="p-5 pt-10">
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
                    </CardContent>
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
                    {filteredClients?.map((client: any) => (
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

            renderFormFields={(form, setForm) => (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Client Name</label>
                            <Input placeholder="Client Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Website</label>
                            <Input placeholder="Website URL" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                        </div>
                    </div>
                    
                    <ImageUploader 
                        label="Client Logo"
                        value={form.logo || ''}
                        onChange={(url) => setForm({ ...form, logo: url })}
                        maxSizeMB={10}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sort Order</label>
                            <Input type="number" placeholder="Sort Order" value={form.order || 0} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="flex items-center gap-2 pt-8">
                            <Checkbox
                                checked={form.is_active ?? true}
                                onCheckedChange={(checked: boolean) => setForm({ ...form, is_active: !!checked })}
                                id="is_active_client"
                                className="border-border"
                            />
                            <label htmlFor="is_active_client" className="text-sm font-medium">Active (visible on site)</label>
                        </div>
                    </div>
                </>
            )}
        />
    )
}

export default AdminClientsPage
