import type { ConsultationRequest } from '@/types/api'
import type { AdminResourceConfig } from '@/components/admin/AdminResourceConfig'

export const requestsConfig: AdminResourceConfig<ConsultationRequest> = {
  endpoint: '/consultation-requests',
  resourceName: 'Request',
  title: 'Consultation Requests',
  description: 'Manage inbound consultation requests.',
  actionLabel: 'Add Request',
  statusField: 'status',
  hideStatusFilter: true,
  filterPlaceholder: 'Search by name, email, or subject...',
  initialForm: {
    first_name: '',
    last_name: '',
    email: '',
    subject: '',
    message: '',
    status: 'pending',
  } as Partial<ConsultationRequest>,
  validate: (form) => {
    const f = form as Partial<ConsultationRequest>
    if (!f.first_name) return 'First name is required.'
    if (!f.last_name) return 'Last name is required.'
    if (!f.email) return 'Email is required.'
    return null
  },
  filterFn: (item, term) =>
    item.first_name.toLowerCase().includes(term.toLowerCase()) ||
    item.last_name.toLowerCase().includes(term.toLowerCase()) ||
    item.email.toLowerCase().includes(term.toLowerCase()) ||
    !!(item.subject && item.subject.toLowerCase().includes(term.toLowerCase())),
  fields: [
    { key: 'first_name', label: 'First Name', type: 'text', required: true },
    { key: 'last_name', label: 'Last Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'text', required: true, placeholder: 'user@example.com' },
    { key: 'subject', label: 'Subject', type: 'text' },
    { key: 'message', label: 'Message', type: 'textarea', minRows: 5, span: 2 },
    { key: 'status', label: 'Status', type: 'select', options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Contacted', value: 'contacted' },
      { label: 'Resolved', value: 'resolved' },
      { label: 'Archived', value: 'archived' },
    ]},
  ],
}
