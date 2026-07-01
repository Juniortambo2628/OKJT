import type { Pillar } from '@/types/api'
import type { AdminResourceConfig } from '@/components/admin/AdminResourceConfig'

export const pillarsConfig: AdminResourceConfig<Pillar> = {
  endpoint: '/pillars',
  resourceName: 'Pillar',
  title: 'Our Approach Pillars',
  description: 'Manage the strategic pillars shown on the Our Approach page.',
  actionLabel: 'Add Pillar',
  initialForm: {
    title: '',
    overview: '',
    content: '',
    icon: 'Activity',
    image: '',
    is_active: true,
  },
  validate: (form) => {
    if (!form.title) return 'Title is required'
    return null
  },
  filterFn: (p, term) =>
    p.title.toLowerCase().includes(term.toLowerCase()),
  fields: [
    { key: 'title', label: 'Title', type: 'text', required: true, span: 2 },
    { key: 'overview', label: 'Short Overview', type: 'text', span: 2 },
    { key: 'content', label: 'Detailed Content', type: 'rich-text', richTextMinHeight: 200, span: 2 },
    { key: 'image', label: 'Overview Background Image', type: 'image', span: 2, imageAccept: ['.jpg', '.jpeg', '.png', '.webp'], helperText: 'This image will be used as the background for the pillar overview section.' },
    { key: 'icon', label: 'Icon', type: 'icon-picker' },
    { key: 'is_active', label: 'Active', type: 'checkbox' },
  ],
}
