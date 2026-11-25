import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PermissionsProvider } from '@okjt/ui'
import { AdminContactMessages, DashboardProvider } from '../dist/index.js'

const toast = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }))
vi.mock('react-hot-toast', () => ({ toast, default: toast }))
const feedback = vi.hoisted(() => ({ confirm: vi.fn() }))
vi.mock('@okjt/ui', async (importOriginal) => ({ ...(await importOriginal()), confirmAction: (...a) => feedback.confirm(...a) }))

const AMINA = { id: 1, name: 'Amina', email: 'amina@example.com', topic: 'bookings', subject: 'Group booking', message: 'Can 12 of us come?', status: 'new', reply_message: null, replied_at: null, created_at: '2026-11-20T09:30:00Z' }
const LIST = { data: { data: { data: [AMINA], meta: { current_page: 1, last_page: 1, total: 1 }, counts: { new: 1, replied: 4 } } } }

function wrap(api) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <DashboardProvider dashboard={{ api }}>
        <PermissionsProvider value={{ role: 'owner', isOwner: true, canEdit: true }}><AdminContactMessages /></PermissionsProvider>
      </DashboardProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => { vi.clearAllMocks(); feedback.confirm.mockResolvedValue(true) })

describe('AdminContactMessages (S6, step 5)', () => {
  it('opens on new messages, with counts per status, and filters and searches', async () => {
    const api = { get: vi.fn().mockResolvedValue(LIST) }
    wrap(api)
    expect(await screen.findByText('Amina · Group booking')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/admin/contact-messages', { params: { status: 'new', page: 1 } })
    expect(screen.getByRole('tab', { name: 'Replied · 4' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'All' }))
    await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/admin/contact-messages', { params: { page: 1 } }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search messages' }), { target: { value: 'amina' } })
    await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/admin/contact-messages', { params: { search: 'amina', page: 1 } }))
  })

  it('opens a message, replies by email, and shows the reply', async () => {
    const api = {
      get: vi.fn().mockImplementation((url) => Promise.resolve(url.endsWith('/1') ? { data: { data: { ...AMINA, status: 'read' } } } : LIST)),
      post: vi.fn().mockResolvedValue({ data: { data: { ...AMINA, status: 'replied', reply_message: 'Yes, all 12.', replied_at: '2026-11-20T10:00:00Z' } } }),
    }
    wrap(api)
    fireEvent.click(await screen.findByText('Amina · Group booking'))
    expect(await screen.findByRole('heading', { name: 'Group booking' })).toBeInTheDocument()
    expect(screen.getByText('Can 12 of us come?')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Reply'), { target: { value: 'Yes, all 12.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send reply to amina@example.com' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/admin/contact-messages/1/reply', { message: 'Yes, all 12.' }))
    expect(await screen.findByText('Yes, all 12.')).toBeInTheDocument()
    expect(screen.getByLabelText('Reply again')).toBeInTheDocument()
  })

  it('archives, and deletes after asking', async () => {
    const api = {
      get: vi.fn().mockImplementation((url) => Promise.resolve(url.endsWith('/1') ? { data: { data: AMINA } } : LIST)),
      patch: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
    }
    wrap(api)
    fireEvent.click(await screen.findByText('Amina · Group booking'))
    fireEvent.click(await screen.findByRole('button', { name: 'Archive' }))
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/admin/contact-messages/1', { status: 'archived' }))

    fireEvent.click(await screen.findByText('Amina · Group booking'))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/admin/contact-messages/1'))
    expect(feedback.confirm).toHaveBeenCalledWith(expect.objectContaining({ title: 'Delete the message from Amina?', tone: 'danger' }))
  })

  it('says when there are no new messages', async () => {
    wrap({ get: vi.fn().mockResolvedValue({ data: { data: { data: [], meta: {}, counts: {} } } }) })
    expect(await screen.findByText('No new messages.')).toBeInTheDocument()
  })
})
