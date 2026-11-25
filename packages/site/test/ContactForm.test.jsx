import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ContactForm } from '../dist/index.js'

afterEach(() => { vi.restoreAllMocks(); document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT' })

const fill = () => {
  fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Amina' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'amina@example.com' } })
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Can 12 of us come?' } })
}

describe('ContactForm (S6, step 5)', () => {
  it('posts to /api/contact with the XSRF cookie and shows the server\'s thanks', async () => {
    document.cookie = 'XSRF-TOKEN=abc%3D'
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 201, json: async () => ({ message: 'Thanks, Amina!' }) })
    render(<ContactForm />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Thanks, Amina!')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/contact')
    expect(init.headers['X-XSRF-TOKEN']).toBe('abc=')
    expect(JSON.parse(init.body)).toEqual({ name: 'Amina', email: 'amina@example.com', message: 'Can 12 of us come?', website: '' })
  })

  it('shows the server\'s field errors beside each field', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 422, json: async () => ({ message: 'Invalid', errors: { email: ['The email field must be a valid email address.'] } }) })
    render(<ContactForm />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByText('The email field must be a valid email address.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Please check the fields marked below.')
  })

  it('says when there have been too many messages', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 429, json: async () => ({ message: 'Too Many Attempts.' }) })
    render(<ContactForm />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Too Many Attempts.')
  })

  it('offers topics, sends through a project\'s own submit, and keeps the honeypot out of reach', async () => {
    const submit = vi.fn().mockResolvedValue({ message: 'Got it' })
    const { container } = render(<ContactForm topics={['Bookings', { value: 'press', label: 'Press' }]} subject={false} submit={submit} />)
    fill()
    fireEvent.change(screen.getByLabelText('What is it about?'), { target: { value: 'press' } })
    expect(screen.queryByLabelText('Subject')).toBeNull()
    const trap = container.querySelector('input[name="website"]')
    expect(trap).toHaveAttribute('tabindex', '-1')
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(submit).toHaveBeenCalledWith({ name: 'Amina', email: 'amina@example.com', topic: 'press', message: 'Can 12 of us come?', website: '' }))
    expect(await screen.findByText('Got it')).toBeInTheDocument()
  })
})
