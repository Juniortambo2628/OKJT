import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PermissionsProvider } from '@okjt/ui'
import { AdminFaqs, DashboardProvider } from '../dist/index.js'

const toast = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }))
vi.mock('react-hot-toast', () => ({ toast, default: toast }))
const feedback = vi.hoisted(() => ({ confirm: vi.fn() }))
vi.mock('@okjt/ui', async (importOriginal) => ({ ...(await importOriginal()), confirmAction: (...a) => feedback.confirm(...a) }))

const FAQS = [
  { id: 1, question: 'Is there parking?', answer: 'Yes, free.', order: 1, group: null },
  { id: 2, question: 'Dress code?', answer: 'Smart casual.', order: 2, group: null },
]

function wrap(api, props = {}) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <DashboardProvider dashboard={{ api }}>
        <PermissionsProvider value={{ role: 'owner', isOwner: true, canEdit: true }}><AdminFaqs {...props} /></PermissionsProvider>
      </DashboardProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => { vi.clearAllMocks(); feedback.confirm.mockResolvedValue(true) })

describe('AdminFaqs (S6, step 4)', () => {
  it('lists the questions in order, for one group when asked', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: FAQS } }) }
    wrap(api, { group: 'pricing' })
    expect(await screen.findByText('Is there parking?')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/faqs', { params: { group: 'pricing' } })
  })

  it('adds a question to the group', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: FAQS } }), post: vi.fn().mockResolvedValue({ data: {} }) }
    wrap(api, { group: 'pricing' })
    fireEvent.click(await screen.findByRole('button', { name: 'Add a question' }))
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'Refunds?' } })
    fireEvent.change(screen.getByLabelText('Answer'), { target: { value: 'Within 14 days.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/faqs', { question: 'Refunds?', answer: 'Within 14 days.', group: 'pricing' }))
  })

  it('edits one in place', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: FAQS } }), put: vi.fn().mockResolvedValue({ data: {} }) }
    wrap(api)
    fireEvent.click((await screen.findAllByRole('button', { name: 'Edit' }))[1])
    fireEvent.change(screen.getByLabelText('Answer'), { target: { value: 'Formal.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/faqs/2', { question: 'Dress code?', answer: 'Formal.', group: null }))
  })

  it('moves a question and saves the new order straight away', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: FAQS } }), put: vi.fn().mockResolvedValue({ data: {} }) }
    wrap(api)
    fireEvent.click(await screen.findByRole('button', { name: 'Move "Dress code?" up' }))
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/faqs/reorder', { ids: [2, 1] }))
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Dress code?')
  })

  it('asks before deleting, and offers to add the first one when empty', async () => {
    const api = { get: vi.fn().mockResolvedValueOnce({ data: { data: FAQS } }).mockResolvedValue({ data: { data: [] } }), delete: vi.fn().mockResolvedValue({ data: {} }) }
    wrap(api)
    fireEvent.click(await screen.findByRole('button', { name: 'Delete "Is there parking?"' }))
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/faqs/1'))
    expect(feedback.confirm).toHaveBeenCalledWith(expect.objectContaining({ title: 'Delete "Is there parking?"?', tone: 'danger' }))
    expect(await screen.findByText('No questions yet.')).toBeInTheDocument()
  })
})
