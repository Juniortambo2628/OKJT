import type { Project } from '@/types/api'
import type { AdminResourceConfig } from '@/components/admin/AdminResourceConfig'

export const projectsConfig: AdminResourceConfig<Project> = {
  endpoint: '/projects',
  resourceName: 'Project',
  title: 'Projects',
  description: 'Manage portfolio projects and case studies.',
  actionLabel: 'Add Project',
  statusField: 'is_active',
  dialogSizeClass: 'max-w-4xl',
  filterPlaceholder: 'Search by title, client, or category...',
  initialForm: {
    type: 'client',
    title: '',
    client_name: '',
    tagline: '',
    category: '',
    technologies: [],
    significant_figure: '',
    description: '',
    problem: '',
    methodology: '',
    outcome: '',
    testimonial_quote: '',
    testimonial_author: '',
    image: '',
    bg_image: '',
    gallery: [],
    url: '',
    is_active: true,
    is_featured: false,
    order: 0,
  },
  validate: (form) => {
    if (!form.title) return 'Title is required.'
    return null
  },
  filterFn: (project: Project, term: string) => {
    const s = term.toLowerCase()
    return (
      project.title.toLowerCase().includes(s) ||
      (project.client_name || '').toLowerCase().includes(s) ||
      (project.category || '').toLowerCase().includes(s)
    )
  },
  fields: [
    { key: 'type', label: 'Project Type', type: 'select', options: [
      { label: 'Client Project', value: 'client' },
      { label: 'Flagship Project', value: 'flagship' },
    ]},
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'client_name', label: 'Client Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'tagline', label: 'Short Description', type: 'text', span: 2 },
    { key: 'technologies', label: 'Technologies (comma-separated)', type: 'text', span: 2, helperText: 'e.g. React, Laravel, PostgreSQL' },
    { key: 'description', label: 'Full Description', type: 'rich-text', richTextMinHeight: 120, span: 2 },
    { key: 'problem', label: 'The Problem', type: 'rich-text', richTextMinHeight: 120, span: 2 },
    { key: 'methodology', label: 'Methodology & Approach', type: 'rich-text', richTextMinHeight: 120, span: 2 },
    { key: 'outcome', label: 'Outcome & Results', type: 'rich-text', richTextMinHeight: 120, span: 2 },
    { key: 'testimonial_author', label: 'Testimonial Author', type: 'text' },
    { key: 'testimonial_quote', label: 'Testimonial Quote', type: 'rich-text', richTextMinHeight: 100, span: 2 },
    { key: 'image', label: 'Featured Image', type: 'image', span: 2 },
    { key: 'gallery', label: 'Gallery Images (comma-separated URLs)', type: 'text', span: 2 },
    { key: 'url', label: 'Project URL', type: 'text' },
    { key: 'is_featured', label: 'Featured Project', type: 'checkbox' },
  ],
}
