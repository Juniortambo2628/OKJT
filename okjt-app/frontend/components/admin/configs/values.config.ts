import type { Value } from '@/types/api'
import type { AdminResourceConfig } from '@/components/admin/AdminResourceConfig'

export const valuesConfig: AdminResourceConfig<Value> = {
  endpoint: '/values',
  resourceName: 'Value',
  title: 'Core Values',
  description: 'Manage the company values displayed on the About page.',
  actionLabel: 'Add Value',
  gridColsClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  dialogSizeClass: 'max-w-md',
  initialSortBy: 'order',
  initialSortOrder: 'asc',
  hideStatusFilter: true,
  initialForm: {
    icon: 'Shield',
    title: '',
    description: '',
    order: 0,
  },
  validate: (form) => {
    if (!form.title || !form.description) return 'Title and Description are required'
    return null
  },
  filterFn: (v, term) =>
    (v.title || '').toLowerCase().includes(term.toLowerCase()) ||
    (v.description || '').toLowerCase().includes(term.toLowerCase()),
  fields: [
    { key: 'icon', label: 'Icon', type: 'icon-picker' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea', minRows: 3 },
    { key: 'order', label: 'Display Order', type: 'number' },
  ],
}
