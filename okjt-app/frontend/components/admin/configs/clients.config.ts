import type { Client } from '@/types/api'
import type { AdminResourceConfig } from '@/components/admin/AdminResourceConfig'

export const clientsConfig: AdminResourceConfig<Client> = {
  endpoint: '/clients',
  resourceName: 'Client',
  title: 'Client Directory',
  description: 'Manage the clients featured on the site.',
  actionLabel: 'Add Client',
  initialForm: {
    name: '',
    logo: '',
    website: '',
    is_active: true,
    order: 0,
  },
  validate: (form) => {
    if (!form.name) return 'Client Name is required'
    return null
  },
  filterFn: (c, term) =>
    (c.name || '').toLowerCase().includes(term.toLowerCase()),
  fields: [
    { key: 'name', label: 'Client Name', type: 'text', required: true },
    { key: 'website', label: 'Website', type: 'text', placeholder: 'https://...' },
    { key: 'logo', label: 'Client Logo', type: 'image', imageMaxSizeMB: 10, span: 2 },
    { key: 'order', label: 'Sort Order', type: 'number' },
    { key: 'is_active', label: 'Active', type: 'checkbox' },
  ],
}
