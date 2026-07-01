import type { Testimonial } from '@/types/api'
import type { AdminResourceConfig } from '@/components/admin/AdminResourceConfig'

export const testimonialsConfig: AdminResourceConfig<Testimonial> = {
  endpoint: '/testimonials',
  resourceName: 'Testimonial',
  title: 'Testimonials',
  description: 'Manage client testimonials shown on the landing page.',
  actionLabel: 'Add Testimonial',
  statusField: 'is_featured',
  activeLabel: 'Featured',
  inactiveLabel: 'Standard',
  dialogSizeClass: 'max-w-3xl',
  initialForm: {
    name: '',
    role: '',
    company: '',
    quote: '',
    avatar: '',
    rating: 5,
    is_featured: true,
    order: 0,
  },
  validate: (form) => {
    if (!form.name || !form.quote) return 'Name and Quote are required'
    return null
  },
  filterFn: (t, term) =>
    (t.name || '').toLowerCase().includes(term.toLowerCase()) ||
    (t.company || '').toLowerCase().includes(term.toLowerCase()),
  fields: [
    { key: 'name', label: 'Client Name', type: 'text', required: true },
    { key: 'role', label: 'Role / Title', type: 'text' },
    { key: 'company', label: 'Company', type: 'text' },
    { key: 'avatar', label: 'Client Avatar', type: 'image', imageMaxSizeMB: 10, span: 2 },
    { key: 'quote', label: 'Testimonial Quote', type: 'textarea', minRows: 5, span: 2 },
    { key: 'rating', label: 'Rating (1-5)', type: 'number' },
    { key: 'order', label: 'Sort Order', type: 'number' },
    { key: 'is_featured', label: 'Featured', type: 'checkbox' },
  ],
}
