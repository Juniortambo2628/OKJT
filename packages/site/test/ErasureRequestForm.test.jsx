import { render, screen, fireEvent } from '@testing-library/react'
import { ErasureRequestForm } from '../dist/index.js'

afterEach(() => { vi.restoreAllMocks() })

describe('ErasureRequestForm (S7)', () => {
  it('posts the name and phone (one way to find them is enough) and shows the server\'s answer', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 201, json: async () => ({ message: "We'll deal with it within 14 days." }) })
    render(<ErasureRequestForm />)
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Amina' } })
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '0700 000 001' } })
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Give the email or phone number you used with us; one is enough.')
    fireEvent.click(screen.getByRole('button', { name: 'Ask for my data to be deleted' }))
    expect(await screen.findByRole('status')).toHaveTextContent("We'll deal with it within 14 days.")
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/erasure-requests')
    expect(JSON.parse(init.body)).toEqual({ name: 'Amina', phone: '0700 000 001', website: '' })
  })

  it('shows field errors beside the fields', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 422, json: async () => ({ errors: { email: ['Give an email or a phone number.'], phone: ['Give an email or a phone number.'] } }) })
    render(<ErasureRequestForm />)
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Amina' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ask for my data to be deleted' }))
    expect(await screen.findAllByText('Give an email or a phone number.')).toHaveLength(2)
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('can ask for email only', () => {
    render(<ErasureRequestForm phone={false} />)
    expect(screen.queryByLabelText('Phone')).toBeNull()
    expect(screen.getByLabelText('Email')).toBeRequired()
  })
})
