"use client"

import React, { useState } from 'react'
import AdminPageHeader from './AdminPageHeader'
import { Button } from '@/components/ui/button'
import { Save, RefreshCw, Loader2, Trash2 } from 'lucide-react'

interface SettingsHeaderProps {
    title: string
    description: string
    onSave: () => void | Promise<void>
    onRefresh?: () => void
    onDelete?: () => void
    isSaving?: boolean
    isLoading?: boolean
    isRefreshing?: boolean
    deleteLabel?: string
    deleteDisabled?: boolean
    children?: React.ReactNode
}

export default function SettingsHeader({
    title,
    description,
    onSave,
    onRefresh,
    onDelete,
    isSaving = false,
    isLoading = false,
    isRefreshing = false,
    deleteLabel = 'Delete',
    deleteDisabled = false,
    children,
}: SettingsHeaderProps) {
    const [saveSuccess, setSaveSuccess] = useState(false)

    const handleSave = async () => {
        try {
            await onSave()
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch {
            // Error handled by caller
        }
    }

    return (
        <div className="flex items-center justify-between">
            <AdminPageHeader title={title} description={description} />
            <div className="flex gap-3">
                {children}
                {onRefresh && (
                    <Button
                        variant="outline"
                        className="bg-transparent border-border hover:bg-secondary text-foreground"
                        onClick={onRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw size={18} className={isRefreshing || isLoading ? "animate-spin" : ""} />
                    </Button>
                )}
                {onDelete && (
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        disabled={deleteDisabled || isSaving}
                        className="gap-2"
                    >
                        <Trash2 size={16} />
                        {deleteLabel}
                    </Button>
                )}
                <Button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className={`gap-2 px-8 font-bold shadow-xl transition-all ${
                        saveSuccess
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'shadow-primary/20 bg-primary hover:bg-primary/90 text-white'
                    }`}
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saveSuccess ? 'Saved!' : 'Save Changes'}
                </Button>
            </div>
        </div>
    )
}
