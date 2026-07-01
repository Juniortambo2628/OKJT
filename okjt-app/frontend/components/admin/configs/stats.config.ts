import type { Stat } from '@/types/api'
import type { AdminResourceConfig } from '@/components/admin/AdminResourceConfig'

export const statsConfig: AdminResourceConfig<Stat> = {
  endpoint: '/stats',
  resourceName: 'Stat',
  title: 'Key Statistics',
  description: 'Manage the performance metrics shown on the landing page.',
  actionLabel: 'Add Stat',
  gridColsClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  initialForm: {
    label: '',
    value: '',
    description: '',
    order: 0,
    icon: '',
  },
  validate: (form) => {
    if (!form.value || !form.label) return 'Value and Label are required'
    return null
  },
  filterFn: (s, term) =>
    (s.label || '').toLowerCase().includes(term.toLowerCase()) ||
    (s.value || '').toLowerCase().includes(term.toLowerCase()),
  fields: [
    { key: 'value', label: 'Value (e.g. 180 M)', type: 'text', placeholder: 'Stat Value' },
    { key: 'label', label: 'Label (e.g. PPA Portfolio)', type: 'text', placeholder: 'Stat Label' },
    { key: 'description', label: 'Description', type: 'text', placeholder: 'Brief description of this metric' },
    { key: 'order', label: 'Sort Order', type: 'number' },
    { key: 'icon', label: 'Icon Name', type: 'text', placeholder: 'e.g. Activity, Users' },
  ],
}
