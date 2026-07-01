import type { TeamMember } from '@/types/api'
import type { AdminResourceConfig } from '@/components/admin/AdminResourceConfig'

export const teamConfig: AdminResourceConfig<TeamMember> = {
  endpoint: '/team-members',
  resourceName: 'Team Member',
  title: 'Team Members',
  description: 'Manage the team members displayed on the About page.',
  actionLabel: 'Add Member',
  dialogSizeClass: 'max-w-2xl',
  initialSortBy: 'order',
  initialSortOrder: 'asc',
  hideStatusFilter: true,
  initialForm: {
    name: '',
    role: '',
    bio: '',
    qualifications: '',
    linkedin: '',
    image: '',
    order: 0,
  },
  validate: (form) => {
    if (!form.name) return 'Name is required'
    if (!form.role) return 'Role is required'
    return null
  },
  filterFn: (m, term) =>
    m.name.toLowerCase().includes(term.toLowerCase()) ||
    (m.role || '').toLowerCase().includes(term.toLowerCase()),
  fields: [
    { key: 'name', label: 'Full Name', type: 'text', required: true },
    { key: 'role', label: 'Role / Title', type: 'text', required: true },
    { key: 'qualifications', label: 'Qualifications', type: 'text' },
    { key: 'linkedin', label: 'LinkedIn URL', type: 'text', placeholder: 'https://linkedin.com/in/...' },
    { key: 'image', label: 'Profile Photo', type: 'image', imageMaxSizeMB: 10 },
    { key: 'order', label: 'Display Order', type: 'number' },
    { key: 'bio', label: 'Short Bio', type: 'textarea', minRows: 4, span: 2 },
  ],
}
