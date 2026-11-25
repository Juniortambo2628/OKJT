import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PermissionsProvider } from '@okjt/ui'
import { AdminMpesaSettings, DashboardProvider } from '../dist/index.js'

const toast = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }))
vi.mock('react-hot-toast', () => ({ toast, default: toast }))
const feedback = vi.hoisted(() => ({ confirm: vi.fn() }))
vi.mock('@okjt/ui', async (importOriginal) => ({ ...(await importOriginal()), confirmAction: (...a) => feedback.confirm(...a) }))

const SETTINGS = { on: true, configured: true, env: 'sandbox', consumer_key: 'key-1', consumer_secret_set: true, shortcode: '174379', type: 'paybill', till_number: null, passkey_set: true, callback_url: 'https://shop.test/api/mpesa/callback/…' }

function wrap(api) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <DashboardProvider dashboard={{ api }}>
        <PermissionsProvider value={{ role: 'owner', isOwner: true, canEdit: true }}><AdminMpesaSettings /></PermissionsProvider>
      </DashboardProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => { vi.clearAllMocks(); feedback.confirm.mockResolvedValue(true) })

describe('AdminMpesaSettings (R5)', () => {
  it('shows the settings, never the secrets, and saves without blank secrets', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: SETTINGS } }), put: vi.fn().mockResolvedValue({ data: { data: SETTINGS } }) }
    wrap(api)
    expect(await screen.findByText('Switched on and set up.')).toBeInTheDocument()
    expect(screen.getByLabelText('Consumer secret')).toHaveValue('')
    expect(screen.getByLabelText('Consumer secret')).toHaveAttribute('placeholder', 'Saved; type a new one to replace it')
    expect(screen.getByText('https://shop.test/api/mpesa/callback/…')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Paybill number'), { target: { value: '600100' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/admin/mpesa', { env: 'sandbox', consumer_key: 'key-1', shortcode: '600100', type: 'paybill', till_number: '' }))
    expect(feedback.confirm).not.toHaveBeenCalled()
  })

  it('asks before switching to live M-Pesa, and asks for the till number for a till', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: SETTINGS } }), put: vi.fn().mockResolvedValue({ data: { data: SETTINGS } }) }
    wrap(api)
    await screen.findByText('Switched on and set up.')
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'till' } })
    expect(screen.getByLabelText('Store number')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Till number'), { target: { value: '5001234' } })
    fireEvent.change(screen.getByLabelText('Passkey'), { target: { value: 'new-passkey' } })
    fireEvent.change(screen.getByLabelText('Environment'), { target: { value: 'production' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(api.put).toHaveBeenCalled())
    expect(feedback.confirm.mock.calls[0][0]).toMatchObject({ title: 'Use live M-Pesa?' })
    expect(api.put.mock.calls[0][1]).toMatchObject({ env: 'production', type: 'till', till_number: '5001234', passkey: 'new-passkey' })
  })

  it('says when M-Pesa is switched off', async () => {
    wrap({ get: vi.fn().mockResolvedValue({ data: { data: { ...SETTINGS, on: false } } }) })
    expect(await screen.findByText('Switched off.')).toBeInTheDocument()
  })
})
