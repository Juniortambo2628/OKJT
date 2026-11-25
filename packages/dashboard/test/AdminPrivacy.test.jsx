import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PermissionsProvider } from '@okjt/ui'
import { AdminPrivacy, DashboardProvider } from '../dist/index.js'

const toast = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }))
vi.mock('react-hot-toast', () => ({ toast, default: toast }))
const feedback = vi.hoisted(() => ({ confirm: vi.fn() }))
vi.mock('@okjt/ui', async (importOriginal) => ({ ...(await importOriginal()), confirmAction: (...a) => feedback.confirm(...a) }))

const OPEN = { id: 7, name: 'Amina', email: 'amina@example.com', phone: null, details: 'I came to the open day.', status: 'received', overdue: true, due_at: '2026-11-15T10:00:00Z', completed_at: null, outcome: null }
const DONE = { id: 3, name: 'Brian', email: null, phone: '0700 000 002', details: null, status: 'done', overdue: false, due_at: '2026-10-01T10:00:00Z', completed_at: '2026-09-20T10:00:00Z', outcome: '2 contact messages deleted.' }
const DATA = { data: { data: {
  retention: [{ label: 'Contact messages', period: '365 days after they were sent', due: 3 }, { label: 'Guest lists', period: null, due: 0 }],
  erasure_days: 14, auto_complete: false, requests: [OPEN, DONE],
} } }

function wrap(api) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <DashboardProvider dashboard={{ api }}>
        <PermissionsProvider value={{ role: 'owner', isOwner: true, canEdit: true }}><AdminPrivacy /></PermissionsProvider>
      </DashboardProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => { vi.clearAllMocks(); feedback.confirm.mockResolvedValue(true) })
const row = (name) => screen.getByText(name).closest('li')

describe('AdminPrivacy (S7)', () => {
  it('shows each retention rule and the requests, overdue ones marked', async () => {
    wrap({ get: vi.fn().mockResolvedValue(DATA) })
    expect(await screen.findByText('Kept 365 days after they were sent · 3 past their time, deleted by the daily run')).toBeInTheDocument()
    expect(screen.getByText('Kept until deleted')).toBeInTheDocument()
    expect(screen.getByText('Each must be dealt with within 14 days.')).toBeInTheDocument()
    expect(within(row('Amina')).getByText(/Overdue since Nov 15, 2026/)).toBeInTheDocument()
    expect(within(row('Brian')).getByText('2 contact messages deleted.')).toBeInTheDocument()
    expect(within(row('Brian')).queryByRole('button')).toBeNull()
  })

  it('deletes their data after asking, and reloads', async () => {
    const api = { get: vi.fn().mockResolvedValue(DATA), post: vi.fn().mockResolvedValue({ data: { message: 'Their data was deleted' } }) }
    wrap(api)
    fireEvent.click(await screen.findByRole('button', { name: 'Delete their data' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/admin/privacy/erasure-requests/7/complete', { action: 'erase' }))
    expect(feedback.confirm.mock.calls[0][0]).toMatchObject({ title: "Delete what's held about Amina?", tone: 'danger' })
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2))
  })

  it('declines with the reason typed, and does nothing without one', async () => {
    const api = { get: vi.fn().mockResolvedValue(DATA), post: vi.fn().mockResolvedValue({ data: {} }) }
    wrap(api)
    feedback.confirm.mockResolvedValueOnce(null)
    fireEvent.click(await screen.findByRole('button', { name: 'Decline' }))
    await waitFor(() => expect(feedback.confirm).toHaveBeenCalledTimes(1))
    expect(api.post).not.toHaveBeenCalled()

    feedback.confirm.mockResolvedValueOnce('We must keep invoices for 6 years')
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/admin/privacy/erasure-requests/7/complete', { action: 'decline', outcome: 'We must keep invoices for 6 years' }))
  })

  it('records a request that came another way', async () => {
    const api = { get: vi.fn().mockResolvedValue(DATA), post: vi.fn().mockResolvedValue({ data: {} }) }
    wrap(api)
    fireEvent.click(await screen.findByRole('button', { name: 'Record a request' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Chebet' } })
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '0700 000 003' } })
    fireEvent.click(screen.getByRole('button', { name: 'Record request' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/admin/privacy/erasure-requests', { name: 'Chebet', phone: '0700 000 003' }))
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Record request' })).toBeNull())
  })

  it('offers to try again when it could not load', async () => {
    wrap({ get: vi.fn().mockRejectedValue(new Error('down')) })
    expect(await screen.findByText("The privacy settings couldn't be loaded.")).toBeInTheDocument()
  })
})
