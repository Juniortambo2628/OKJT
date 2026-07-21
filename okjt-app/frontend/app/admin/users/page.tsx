"use client"

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { User } from '@/types/api'
import AdminResourceTemplate from '@/components/admin/core/AdminResourceTemplate'
import { ResourceTableRow } from '@/components/admin/ResourceTableRow'
import { renderFieldsFromConfig } from '@/components/admin/AdminResourceConfig'
import { usersConfig } from '@/components/admin/configs/users.config'

const AdminUsersPage = () => {
    const { endpoint, resourceName, title, description, actionLabel, initialForm, validate, filterFn, fields, ...configRest } = usersConfig

    return (
        <AdminResourceTemplate<User>
            endpoint={endpoint}
            resourceName={resourceName}
            title={title}
            description={description}
            actionLabel={actionLabel}
            initialForm={initialForm}
            filterFn={filterFn}
            onValidate={validate}
            {...configRest}
            sortOptions={[
                { label: 'Date', value: 'created_at' },
                { label: 'Name', value: 'name' },
                { label: 'Email', value: 'email' },
            ]}

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
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Name</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Email</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Role</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Joined</th>
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
                        <td className="p-4 font-medium">{item.name}</td>
                        <td className="p-4 text-muted-foreground">{item.email}</td>
                        <td className="p-4">
                            <Badge
                                variant="outline"
                                className={item.is_admin
                                    ? 'bg-primary/10 text-primary border-primary/20'
                                    : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                }
                            >
                                {item.is_admin ? 'Admin' : 'User'}
                            </Badge>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                        </td>
                    </ResourceTableRow>
                ))
            )}

            renderFormFields={(form, setForm) => renderFieldsFromConfig(fields, form as Record<string, any>, setForm as any)}
        />
    )
}

export default AdminUsersPage
