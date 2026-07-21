import type { User } from '@/types/api'
import type { AdminResourceConfig } from '@/components/admin/AdminResourceConfig'

export const usersConfig: AdminResourceConfig<User> = {
  endpoint: '/users',
  resourceName: 'User',
  title: 'User Management',
  description: 'Manage admin users and their access.',
  actionLabel: 'Add User',
  initialForm: {
    name: '',
    email: '',
    is_admin: true,
  },
  validate: (form) => {
    if (!form.name) return 'Name is required'
    if (!form.email) return 'Email is required'
    return null
  },
  filterFn: (u, term) =>
    (u.name || '').toLowerCase().includes(term.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(term.toLowerCase()),
  hideStatusFilter: true,
  fields: [
    { key: 'name', label: 'Full Name', type: 'text', required: true },
    { key: 'email', label: 'Email Address', type: 'text', required: true, placeholder: 'user@example.com' },
    { key: 'password', label: 'Password', type: 'text', placeholder: 'Leave blank to keep current (edit mode)' },
    { key: 'is_admin', label: 'Administrator', type: 'checkbox', placeholder: 'Grant admin privileges' },
  ],
}
