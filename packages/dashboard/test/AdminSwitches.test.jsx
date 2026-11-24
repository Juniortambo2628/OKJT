import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PermissionsProvider } from '@okjt/ui'
import { AdminSwitches, DashboardProvider } from '../dist/index.js'

const toast = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }))
vi.mock('react-hot-toast', () => ({ toast, default: toast }))
const feedback = vi.hoisted(() => ({ confirm: vi.fn() }))
vi.mock('@okjt/ui', async (importOriginal) => ({
  ...(await importOriginal()),
  confirmAction: (...args) => feedback.confirm(...args),
}))

const SWITCHES = [
  { key: 'mpesa_extras', label: 'Sell extras with M-Pesa', description: 'Guests pay for extras.', on: false, default: false, flipped: false },
  { key: 'new_reports', label: 'New reports', description: null, on: false, default: true, flipped: true },
]

function renderWith(api, props = {}, role = 'owner') {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <DashboardProvider dashboard={{ api }}>
        <PermissionsProvider value={{ role, isOwner: role === 'owner', canEdit: role !== 'viewer' }}>
          <AdminSwitches {...props} />
        </PermissionsProvider>
      </DashboardProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  feedback.confirm.mockResolvedValue(true)
})

describe('AdminSwitches (S2)', () => {
  it('lists each switch with what it does, and says when one differs from its default', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: SWITCHES } }), put: vi.fn() }
    renderWith(api)
    const extras = await screen.findByRole('switch', { name: 'Sell extras with M-Pesa' })
    expect(extras).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText('Guests pay for extras.')).toBeInTheDocument()
    expect(screen.getByText('Changed here; the default is on.')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/switches')
  })

  it('asks, then flips the switch on the server and on screen', async () => {
    const api = {
      get: vi.fn().mockResolvedValue({ data: { data: SWITCHES } }),
      put: vi.fn().mockResolvedValue({ data: { data: { ...SWITCHES[0], on: true, flipped: true }, message: 'Sell extras with M-Pesa: on' } }),
    }
    renderWith(api)
    fireEvent.click(await screen.findByRole('switch', { name: 'Sell extras with M-Pesa' }))
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/switches/mpesa_extras', { on: true }))
    expect(feedback.confirm).toHaveBeenCalledWith(expect.objectContaining({ title: 'Turn on "Sell extras with M-Pesa"?', confirmLabel: 'Turn on' }))
    await waitFor(() => expect(screen.getByRole('switch', { name: 'Sell extras with M-Pesa' })).toHaveAttribute('aria-checked', 'true'))
    expect(toast.success).toHaveBeenCalledWith('Sell extras with M-Pesa: on')
  })

  it('leaves the switch alone when the question is cancelled', async () => {
    feedback.confirm.mockResolvedValue(false)
    const api = { get: vi.fn().mockResolvedValue({ data: { data: SWITCHES } }), put: vi.fn() }
    renderWith(api)
    fireEvent.click(await screen.findByRole('switch', { name: 'Sell extras with M-Pesa' }))
    await waitFor(() => expect(feedback.confirm).toHaveBeenCalled())
    expect(api.put).not.toHaveBeenCalled()
    expect(screen.getByRole('switch', { name: 'Sell extras with M-Pesa' })).toHaveAttribute('aria-checked', 'false')
  })

  it('takes another path, and viewers see the switches but cannot flip them', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: SWITCHES } }), put: vi.fn() }
    renderWith(api, { path: '/console/switches' }, 'viewer')
    expect(await screen.findByRole('switch', { name: 'New reports' })).toBeDisabled()
    expect(api.get).toHaveBeenCalledWith('/console/switches')
  })

  it('says when there are none, and offers to try again when loading fails', async () => {
    const empty = { get: vi.fn().mockResolvedValue({ data: { data: [] } }), put: vi.fn() }
    const { unmount } = renderWith(empty)
    expect(await screen.findByText(/No switches yet/)).toBeInTheDocument()
    unmount()

    const broken = { get: vi.fn().mockRejectedValueOnce(new Error('500')).mockResolvedValue({ data: { data: SWITCHES } }), put: vi.fn() }
    renderWith(broken)
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('switch', { name: 'New reports' })).toBeInTheDocument()
  })
})
