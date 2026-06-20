"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import AdminPageHeader from './AdminPageHeader'
import AdminResourceToolbar from './AdminResourceToolbar'
import { useAdminResource } from '@/hooks/use-admin-resource'
import { useToast } from '@/hooks/use-toast'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from '@/components/ui/dialog'

interface AdminResourceTemplateProps<T extends { id: number, created_at?: string }> {
    endpoint: string
    resourceName: string
    title: string
    description: string
    actionLabel: string
    statusField?: keyof T
    initialForm: Partial<T>
    filterFn: (item: T, searchTerm: string) => boolean
    sortFns?: Record<string, (a: T, b: T) => number>
    onValidate?: (form: Partial<T>) => string | null
    initialSortBy?: string
    initialSortOrder?: 'asc' | 'desc'
    hideStatusFilter?: boolean
    sortOptions?: { label: string, value: string }[]
    
    renderGridItem?: (
        item: T, 
        selectedIds: number[], 
        toggleSelect: (id: number) => void,
        onEdit: (item: T) => void, 
        onDelete: (id: number) => void
    ) => React.ReactNode
    
    renderTableHeaders: (
        items: T[],
        selectedIds: number[],
        selectAll: (ids: number[]) => void
    ) => React.ReactNode

    renderTableRows: (
        items: T[],
        selectedIds: number[],
        toggleSelect: (id: number) => void,
        onEdit: (item: T) => void,
        onDelete: (id: number) => void
    ) => React.ReactNode
    
    renderFormFields: (
        form: Partial<T>, 
        setForm: (form: Partial<T>) => void
    ) => React.ReactNode
    
    filterPlaceholder?: string
    activeLabel?: string
    inactiveLabel?: string
    dialogSizeClass?: string
    gridColsClass?: string
    skeletonHeightClass?: string
}

export default function AdminResourceTemplate<T extends { id: number, created_at?: string }>({
    endpoint,
    resourceName,
    title,
    description,
    actionLabel,
    statusField = 'is_active' as keyof T,
    initialForm,
    filterFn,
    sortFns = {},
    onValidate,
    initialSortBy,
    initialSortOrder,
    hideStatusFilter,
    sortOptions,
    renderGridItem,
    renderTableHeaders,
    renderTableRows,
    renderFormFields,
    filterPlaceholder = "Filter...",
    activeLabel,
    inactiveLabel,
    dialogSizeClass = "max-w-2xl",
    gridColsClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    skeletonHeightClass = "h-44",
}: AdminResourceTemplateProps<T>) {
    const { toast } = useToast()

    const {
        filteredData,
        isLoading,
        searchTerm,
        setSearchTerm,
        activeFilter,
        setActiveFilter,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        viewMode,
        setViewMode,
        selectedIds,
        toggleSelect,
        selectAll,
        showForm,
        setShowForm,
        editingId,
        isSaving,
        form,
        setForm,
        resetForm,
        handleEdit,
        handleSave,
        handleDelete,
        handleBulkDelete,
    } = useAdminResource<T>({
        endpoint,
        resourceName,
        statusField,
        initialForm,
        filterFn,
        sortFns,
        initialSortBy,
        initialSortOrder,
    })

    const onSave = async () => {
        if (onValidate) {
            const error = onValidate(form)
            if (error) {
                toast({ variant: "destructive", title: "Validation Error", description: error })
                return
            }
        }
        await handleSave()
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <AdminPageHeader 
                    title={title}
                    description={description}
                    actionLabel={actionLabel}
                    onAction={() => { resetForm(); setShowForm(true); }}
                />

                <AdminResourceToolbar 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder={filterPlaceholder}
                    hideStatusFilter={hideStatusFilter}
                    
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    activeLabel={activeLabel}
                    inactiveLabel={inactiveLabel}
                    
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    sortOrder={sortOrder}
                    onOrderChange={setSortOrder}
                    sortOptions={sortOptions}
                    
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    
                    selectedCount={selectedIds.length}
                    onBulkDelete={handleBulkDelete}
                />

                {/* Create/Edit Modal */}
                <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
                    <DialogContent className={`${dialogSizeClass} max-h-[90vh] overflow-y-auto bg-background border-border text-foreground`}>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit' : 'New'} {resourceName}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {renderFormFields(form, setForm)}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={resetForm} disabled={isSaving}>Cancel</Button>
                            <Button onClick={onSave} disabled={isSaving} className="gap-2">
                                <Save size={16} /> {isSaving ? 'Saving...' : `Save ${resourceName}`}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Main List Grid/Table */}
                {isLoading ? (
                    <div className={`grid ${gridColsClass} gap-4`}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className={`bg-secondary/10 border border-border/50 rounded-xl p-5 ${skeletonHeightClass} animate-pulse`} />
                        ))}
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' && renderGridItem ? (
                            <div className={`grid ${gridColsClass} gap-4`}>
                                {filteredData?.map((item) => (
                                    <React.Fragment key={item.id}>
                                        {renderGridItem(item, selectedIds, toggleSelect, handleEdit, handleDelete)}
                                    </React.Fragment>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-secondary/10 border border-border/50 overflow-hidden rounded-lg">
                                <table className="w-full text-left">
                                    <thead className="bg-secondary/20 border-b border-border/50">
                                        {renderTableHeaders(filteredData, selectedIds, selectAll)}
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {renderTableRows(filteredData, selectedIds, toggleSelect, handleEdit, handleDelete)}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {filteredData?.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-xl opacity-50">
                                <p className="text-muted-foreground">No {resourceName.toLowerCase()}s found.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    )
}
