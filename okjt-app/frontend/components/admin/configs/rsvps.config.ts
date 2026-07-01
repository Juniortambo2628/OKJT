import type { Rsvp } from '@/types/api'
import type { AdminResourceConfig } from '@/components/admin/AdminResourceConfig'

export const rsvpsConfig: AdminResourceConfig<Rsvp> = {
  endpoint: '/rsvps',
  resourceName: 'RSVP',
  title: 'RSVPs',
  description: 'Manage event RSVPs and early access signups.',
  actionLabel: 'Add RSVP',
  statusField: 'type',
  hideStatusFilter: true,
  filterPlaceholder: 'Search by name, email, or company...',
  initialForm: {
    name: '',
    email: '',
    company: '',
    job_title: '',
    sector: '',
    interest: '',
    consent: false,
    newsletter: false,
    type: 'early_access',
    attendance: null,
  } as Partial<Rsvp>,
  validate: (form) => {
    const f = form as Partial<Rsvp>
    if (!f.name) return 'Name is required.'
    if (!f.email) return 'Email is required.'
    return null
  },
  filterFn: (item, term) =>
    item.name.toLowerCase().includes(term.toLowerCase()) ||
    item.email.toLowerCase().includes(term.toLowerCase()) ||
    !!(item.company && item.company.toLowerCase().includes(term.toLowerCase())),
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'text', required: true, placeholder: 'user@example.com' },
    { key: 'company', label: 'Company', type: 'text' },
    { key: 'job_title', label: 'Job Title', type: 'text' },
    { key: 'sector', label: 'Sector', type: 'text' },
    { key: 'interest', label: 'Interest', type: 'text' },
    { key: 'type', label: 'Type', type: 'select', options: [
      { label: 'Early Access', value: 'early_access' },
      { label: 'RSVP', value: 'rsvp' },
    ]},
    { key: 'attendance', label: 'Attendance', type: 'select', options: [
      { label: 'No Response', value: '' },
      { label: 'Accept', value: 'accept' },
      { label: 'Decline', value: 'decline' },
    ]},
    { key: 'consent', label: 'Consent', type: 'switch' },
    { key: 'newsletter', label: 'Newsletter', type: 'switch' },
  ],
}
