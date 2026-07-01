import type { Subscriber } from '@/types/api'
import type { AdminResourceConfig } from '@/components/admin/AdminResourceConfig'

export const subscribersConfig: AdminResourceConfig<Subscriber> = {
  endpoint: '/subscribers',
  resourceName: 'Subscriber',
  title: 'Subscribers',
  description: 'Manage email subscribers.',
  actionLabel: 'Add Subscriber',
  hideStatusFilter: true,
  filterPlaceholder: 'Search by email, name, or source...',
  initialForm: {
    email: '',
    name: '',
    source: 'footer',
    is_active: true,
  } as Partial<Subscriber>,
  validate: (form) => {
    if (!form.email) return 'Email is required.'
    return null
  },
  filterFn: (item, term) =>
    item.email.toLowerCase().includes(term.toLowerCase()) ||
    !!(item.name && item.name.toLowerCase().includes(term.toLowerCase())) ||
    !!(item.source && item.source.toLowerCase().includes(term.toLowerCase())),
  fields: [
    { key: 'email', label: 'Email', type: 'text', required: true, placeholder: 'user@example.com' },
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'source', label: 'Source', type: 'select', options: [
      { label: 'Footer', value: 'footer' },
      { label: 'Form', value: 'form' },
      { label: 'Admin', value: 'admin' },
      { label: 'RSVP', value: 'rsvp' },
    ]},
    { key: 'is_active', label: 'Active', type: 'switch' },
  ],
}
