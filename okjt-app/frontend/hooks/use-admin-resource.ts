"use client"

import { useState, useCallback, useMemo } from 'react'
import { useApi } from './use-api'
import api from '@/lib/api'
import { useToast } from './use-toast'

interface useAdminResourceOptions<T> {
    endpoint: string
    resourceName: string
    initialForm: Partial<T>
    filterFn: (item: T, searchTerm: string) => boolean
    sortFns?: Record<string, (a: T, b: T) => number>
    statusField?: keyof T // defaults to 'is_active'
    initialSortBy?: string
    initialSortOrder?: 'asc' | 'desc'
}

export function useAdminResource<T extends { id: number, created_at?: string }>({
    endpoint,
    resourceName,
    initialForm,
    filterFn,
    sortFns = {},
    statusField = 'is_active' as keyof T,
    initialSortBy = 'created_at',
    initialSortOrder = 'desc',
}: useAdminResourceOptions<T>) {
    const { data, mutate, isLoading } = useApi<T[]>(endpoint)
    const { toast } = useToast()
    
    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [sortBy, setSortBy] = useState<string>(initialSortBy)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder)
    
    // Layout State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    
    // CRUD State
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [form, setForm] = useState<Partial<T>>(initialForm)

    const resetForm = useCallback(() => {
        setForm(initialForm)
        setEditingId(null)
        setShowForm(false)
    }, [initialForm])

    const handleEdit = useCallback((item: T) => {
        setForm(item)
        setEditingId(item.id)
        setShowForm(true)
    }, [])

    const triggerRevalidation = useCallback(async () => {
        try {
            await fetch('/api/revalidate', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: ['okjt-content'] })
            })
        } catch (e) {
            console.error('Failed to trigger revalidation', e)
        }
    }, [])

    const handleSave = async (customFormData?: Partial<T>) => {
        const payload = customFormData || form;
        
        setIsSaving(true)
        try {
            if (editingId) {
                await api.put(`${endpoint}/${editingId}`, payload)
            } else {
                await api.post(endpoint, payload)
            }
            toast({ 
                title: "Success", 
                description: `${resourceName} ${editingId ? 'updated' : 'created'} successfully.` 
            })
            mutate()
            triggerRevalidation()
            resetForm()
        } catch (err: any) {
            toast({ 
                variant: "destructive", 
                title: "Error", 
                description: err.response?.data?.message || `Failed to save ${resourceName.toLowerCase()}` 
            })
            throw err
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm(`Are you sure you want to delete this ${resourceName.toLowerCase()}?`)) return
        try {
            await api.delete(`${endpoint}/${id}`)
            toast({ title: "Deleted", description: `${resourceName} removed.` })
            mutate()
            triggerRevalidation()
            setSelectedIds(prev => prev.filter(i => i !== id))
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: `Failed to delete ${resourceName.toLowerCase()}` })
        }
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} ${resourceName.toLowerCase()}s?`)) return
        
        try {
            await Promise.all(selectedIds.map(id => api.delete(`${endpoint}/${id}`)))
            toast({ title: "Success", description: `${selectedIds.length} resources deleted.` })
            setSelectedIds([])
            mutate()
            triggerRevalidation()
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Bulk delete failed." })
        }
    }

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const selectAll = (ids: number[]) => {
        setSelectedIds(prev => prev.length === ids.length ? [] : ids)
    }

    // Processed Data
    const filteredData = useMemo(() => {
        if (!data) return []
        
        return data.filter((item) => {
            const matchesSearch = filterFn(item, searchTerm)
            const matchesStatus = activeFilter === 'all' || 
                                 (activeFilter === 'active' ? !!(item as any)[statusField] : !(item as any)[statusField])
            return matchesSearch && matchesStatus
        }).sort((a, b) => {
            const factor = sortOrder === 'asc' ? 1 : -1
            
            // Use custom sort function if provided
            if (sortFns[sortBy]) {
                return sortFns[sortBy](a, b) * factor
            }
            
            // Default sort (date/title)
            if (sortBy === 'created_at' && a.created_at && b.created_at) {
                return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * factor
            }
            
            if (sortBy === 'title' && 'title' in a && 'title' in b) {
                return String(a.title).localeCompare(String(b.title)) * factor
            }
            
            return 0
        })
    }, [data, searchTerm, activeFilter, sortBy, sortOrder, filterFn, sortFns])

    return {
        // Data
        data,
        filteredData,
        isLoading,
        mutate,
        
        // Search & Filter
        searchTerm,
        setSearchTerm,
        activeFilter,
        setActiveFilter,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        
        // Layout
        viewMode,
        setViewMode,
        selectedIds,
        setSelectedIds,
        toggleSelect,
        selectAll,
        
        // Form & CRUD
        showForm,
        setShowForm,
        editingId,
        setEditingId,
        isSaving,
        setIsSaving,
        form,
        setForm,
        resetForm,
        handleEdit,
        handleSave,
        handleDelete,
        handleBulkDelete,
    }
}
