import { act, fireEvent, render, screen } from '@testing-library/react'
import { StkPrompt, DashboardProvider } from '../dist/index.js'

const PENDING = { id: 9, phone: '254712345678', amount: 30000, status: 'pending' }
const wrap = (api, props) => render(<DashboardProvider dashboard={{ api }}><StkPrompt payee="Amani Gardens" amount={70000} {...props} /></DashboardProvider>)

describe('StkPrompt (lifted from Naoa, R5)', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  it('sends the prompt, follows it, and shows the receipt once, telling the page', async () => {
    const send = vi.fn().mockResolvedValue({ data: { data: PENDING } })
    const api = { get: vi.fn()
      .mockResolvedValueOnce({ data: { data: PENDING } })
      .mockResolvedValue({ data: { data: { ...PENDING, status: 'paid', mpesa_receipt: 'TKA1B2C3D4' } } }) }
    const onPaid = vi.fn()
    wrap(api, { send, onPaid })

    expect(screen.getByLabelText('Amount (KES)')).toHaveValue(70000)
    fireEvent.change(screen.getByLabelText("Payer's Safaricom number"), { target: { value: '0712 345 678' } })
    fireEvent.change(screen.getByLabelText('Amount (KES)'), { target: { value: '30000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send the M-Pesa prompt' }))

    expect(await screen.findByText(/Waiting for them to enter their M-Pesa PIN for KES 30,000/)).toBeInTheDocument()
    expect(send).toHaveBeenCalledWith({ phone: '0712 345 678', amount: 30000 })
    await act(async () => { await vi.advanceTimersByTimeAsync(3000) })
    await act(async () => { await vi.advanceTimersByTimeAsync(3000) })
    expect(screen.getByRole('status')).toHaveTextContent('Paid. KES 30,000 paid to Amani Gardens, M-Pesa code TKA1B2C3D4.')
    expect(api.get).toHaveBeenCalledWith('/mpesa/payments/9')
    expect(onPaid).toHaveBeenCalledTimes(1)
  })

  it("shows M-Pesa's own words when it didn't go through, and lets them try again", async () => {
    const send = vi.fn().mockResolvedValue({ data: { data: PENDING } })
    const api = { get: vi.fn().mockResolvedValue({ data: { data: { ...PENDING, status: 'failed', result_desc: 'The balance is insufficient for the transaction.' } } }) }
    wrap(api, { send })
    fireEvent.change(screen.getByLabelText("Payer's Safaricom number"), { target: { value: '0712345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send the M-Pesa prompt' }))
    await screen.findByText(/Waiting/)
    await act(async () => { await vi.advanceTimersByTimeAsync(3000) })
    expect(screen.getByRole('status')).toHaveTextContent("M-Pesa didn't take the payment. The balance is insufficient for the transaction.")
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByRole('button', { name: 'Send the M-Pesa prompt' })).toBeInTheDocument()
  })

  it('gives up waiting after two and a half minutes, saying the payment may still show', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: PENDING } }) }
    wrap(api, { send: vi.fn().mockResolvedValue({ data: { data: PENDING } }) })
    fireEvent.change(screen.getByLabelText("Payer's Safaricom number"), { target: { value: '0712345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send the M-Pesa prompt' }))
    await screen.findByText(/Waiting/)
    for (let i = 0; i < 52; i++) await act(async () => { await vi.advanceTimersByTimeAsync(3000) })
    expect(screen.getByRole('status')).toHaveTextContent('No answer from M-Pesa yet.')
  })

  it('keeps the form when sending fails, and can fix the amount', async () => {
    const send = vi.fn().mockRejectedValue(new Error('422'))
    wrap({ get: vi.fn() }, { send, fixedAmount: true })
    expect(screen.getByLabelText('Amount (KES)')).toHaveAttribute('readonly')
    fireEvent.change(screen.getByLabelText("Payer's Safaricom number"), { target: { value: '0812' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send the M-Pesa prompt' }))
    await act(async () => {})
    expect(screen.getByRole('button', { name: 'Send the M-Pesa prompt' })).toBeEnabled()
  })
})
