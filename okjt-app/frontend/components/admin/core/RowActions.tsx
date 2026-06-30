import React from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

interface RowActionsProps {
    onEdit: () => void
    onDelete: () => void
    editSize?: number
    deleteSize?: number
}

export function RowActions({ onEdit, onDelete, editSize = 14, deleteSize = 14 }: RowActionsProps) {
    return (
        <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onEdit}>
                <Pencil size={editSize} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive/40 hover:text-destructive" onClick={onDelete}>
                <Trash2 size={deleteSize} />
            </Button>
        </div>
    )
}
