import type { Insight } from '@/types/api'
import type { AdminResourceConfig } from '@/components/admin/AdminResourceConfig'

export const insightsConfig: AdminResourceConfig<Insight> = {
  endpoint: '/insights',
  resourceName: 'Insight',
  title: 'Insights',
  description: 'Manage blog posts, articles, and advisory notes.',
  actionLabel: 'Add Insight',
  statusField: 'is_published',
  activeLabel: 'Published',
  inactiveLabel: 'Draft',
  dialogSizeClass: 'max-w-4xl',
  initialForm: {
    title: '',
    category: '',
    excerpt: '',
    content: '',
    image: '',
    is_published: false,
  },
  validate: (form) => {
    if (!form.title) return 'Title is required'
    return null
  },
  filterFn: (i, term) =>
    i.title.toLowerCase().includes(term.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(term.toLowerCase()),
  fields: [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Web Development' },
    { key: 'excerpt', label: 'Excerpt', type: 'rich-text', richTextMinHeight: 100, span: 2 },
    { key: 'content', label: 'Full Content', type: 'rich-text', richTextMinHeight: 300, span: 2 },
    { key: 'image', label: 'Featured Image', type: 'image', imageMaxSizeMB: 10, span: 2 },
    { key: 'is_published', label: 'Published', type: 'checkbox' },
  ],
}
