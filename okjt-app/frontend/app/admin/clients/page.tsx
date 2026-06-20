"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Building2, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import ImageUploader from '@/components/admin/ImageUploader'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'

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
                <Card className="bg-secondary/10 border-border/50 hover:bg-secondary/20 transition-all relative">
                    <div className="absolute top-4 left-4 z-10">
                        <input 
                            type="checkbox"
                            checked={selectedIds.includes(client.id)}
                            onChange={() => toggleSelect(client.id)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                    </div>
                    <CardContent className="p-5 pt-10">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${client.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {client.order}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(client)}>
                                    <Pencil size={12} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(client.id)}>
                                    <Trash2 size={12} />
                                </Button>
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
                </Card>
            )}

            renderTableHeaders={(filteredClients, selectedIds, selectAll) => (
                <tr>
                    <th className="p-4 px-6 w-10">
                        <input 
                            type="checkbox"
                            checked={selectedIds.length === filteredClients?.length && filteredClients?.length > 0}
                            onChange={() => selectAll(filteredClients?.map(i => i.id) || [])}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
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
                        <tr key={client.id} className="hover:bg-primary/5 transition-colors group">
                            <td className="p-4 px-6">
                                <input 
                                    type="checkbox"
                                    checked={selectedIds.includes(client.id)}
                                    onChange={() => toggleSelect(client.id)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                            </td>
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
                                {client.is_active ? (
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Active</span>
                                ) : (
                                    <span className="text-[10px] font-bold text-amber-500 uppercase">Inactive</span>
                                )}
                            </td>
                            <td className="p-4 text-right pr-6">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(client)}><Pencil size={14} /></Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive/40 hover:text-destructive" onClick={() => handleDelete(client.id)}><Trash2 size={14} /></Button>
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
                            <input 
                                type="checkbox" 
                                checked={form.is_active ?? true} 
                                onChange={(e) => setForm({ ...form, is_active: e.target.checked })} 
                                id="is_active_modal"
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="is_active_modal" className="text-sm font-medium">Active (visible on site)</label>
                        </div>
                    </div>
                </>
            )}
        />
    )
}

export default AdminClientsPage
