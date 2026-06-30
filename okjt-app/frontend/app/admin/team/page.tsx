"use client"

import React from 'react'
import { User, Linkedin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { TeamMember } from '@/types/api'
import ImageUploader from '@/components/admin/ImageUploader'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { ResourceCard } from '@/components/admin/ResourceCard'
import { ResourceTableRow } from '@/components/admin/ResourceTableRow'

export default function AdminTeamPage() {
    return (
        <AdminResourceTemplate<TeamMember>
            endpoint="/team-members"
            resourceName="TeamMember"
            title="Team Members"
            description="Manage the professionals leading OKJTech."
            actionLabel="Add Member"
            dialogSizeClass="max-w-2xl"
            initialForm={{
                name: '',
                role: '',
                bio: '',
                qualifications: '',
                linkedin: '',
                image: '',
                order: 0,
            }}
            filterFn={(m, term) =>
                m.name.toLowerCase().includes(term.toLowerCase()) ||
                (m.role || '').toLowerCase().includes(term.toLowerCase())
            }
            sortOptions={[
                { label: 'Order', value: 'order' },
                { label: 'Name', value: 'name' },
                { label: 'Date Created', value: 'created_at' },
            ]}
            initialSortBy="order"
            initialSortOrder="asc"
            hideStatusFilter
            onValidate={(form) => {
                if (!form.name) return 'Name is required'
                if (!form.role) return 'Role is required'
                return null
            }}
            renderGridItem={(member, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <ResourceCard
                    item={member}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                >
                    <div className="p-6 text-center">
                        <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 overflow-hidden border border-primary/20">
                            {member.image ? (
                                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User size={40} className="text-primary/40" />
                                </div>
                            )}
                        </div>
                        <h3 className="font-bold text-lg">{member.name}</h3>
                        <p className="text-primary text-xs font-bold uppercase tracking-wider mb-3">{member.role}</p>
                        <p className="text-muted-foreground text-xs line-clamp-3 mb-4">{member.bio}</p>
                        {member.linkedin && (
                            <a href={member.linkedin} target="_blank" className="text-primary hover:underline flex items-center justify-center gap-1.5 text-xs font-bold">
                                <Linkedin size={12} /> LinkedIn
                            </a>
                        )}
                    </div>
                </ResourceCard>
            )}
            renderTableHeaders={(items, selectedIds, selectAll) => (
                <tr>
                    <th className="p-4 px-6 w-10">
                        <Checkbox
                            checked={selectedIds.length === items?.length && items?.length > 0}
                            onCheckedChange={() => selectAll(items?.map((item) => item.id) || [])}
                            className="border-white/20"
                        />
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Member</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Role</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                </tr>
            )}
            renderTableRows={(items, selectedIds, toggleSelect, handleEdit, handleDelete) => (
                <>
                    {items?.map((member) => (
                        <ResourceTableRow
                            key={member.id}
                            item={member}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleSelect}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        >
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden border border-primary/20 shrink-0">
                                        {member.image ? <img src={member.image} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-2.5 text-primary/40" />}
                                    </div>
                                    <div>
                                        <div className="font-bold">{member.name}</div>
                                        {member.linkedin && <div className="text-[10px] text-primary lowercase">{member.linkedin}</div>}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">{member.role}</span>
                            </td>
                        </ResourceTableRow>
                    ))}
                </>
            )}
            renderFormFields={(form, setForm) => (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                <Input className="bg-background border-border text-foreground" placeholder="Full Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Role / Title</label>
                                <Input className="bg-background border-border text-foreground" placeholder="Role / Title" value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Qualifications</label>
                                <Input className="bg-background border-border text-foreground" placeholder="e.g. MBA, CFA" value={form.qualifications || ''} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">LinkedIn URL</label>
                                <Input className="bg-background border-border text-foreground" placeholder="https://linkedin.com/in/..." value={form.linkedin || ''} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <ImageUploader
                                label="Profile Photo"
                                value={form.image || ''}
                                onChange={(url) => setForm({ ...form, image: url })}
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Display Order</label>
                                <Input type="number" className="bg-background border-border text-foreground" value={form.order || 0} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="col-span-full space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Short Bio</label>
                            <Textarea className="bg-background border-border text-foreground min-h-[120px]" value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                        </div>
                    </div>
                </>
            )}
        />
    )
}
