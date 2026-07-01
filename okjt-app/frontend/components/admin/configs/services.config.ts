import type { Service } from '@/types/api'
import type { AdminResourceConfig } from '@/components/admin/AdminResourceConfig'

export const servicesConfig: AdminResourceConfig<Service> = {
  endpoint: '/services',
  resourceName: 'Service',
  title: 'Services',
  description: 'Manage the services offered by the company.',
  actionLabel: 'Add Service',
  initialForm: {
    title: '',
    category: '',
    pillar_id: undefined,
    description: '',
    content: '',
    icon: 'Activity',
    is_active: true,
  },
  validate: (form) => {
    if (!form.title) return 'Service Title is required'
    return null
  },
  filterFn: (service, term) =>
    service.title.toLowerCase().includes(term.toLowerCase()) ||
    (service.category || '').toLowerCase().includes(term.toLowerCase()),
  fields: [
    { key: 'title', label: 'Service Title', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Web Development' },
    { key: 'description', label: 'Short Description', type: 'text', span: 2 },
    { key: 'content', label: 'Detailed Content', type: 'rich-text', richTextMinHeight: 200, span: 2 },
    { key: 'icon', label: 'Icon', type: 'icon-picker' },
    { key: 'is_active', label: 'Publicly Active', type: 'checkbox' },
  ],
}
