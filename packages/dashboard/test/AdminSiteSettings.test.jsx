import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PermissionsProvider } from '@okjt/ui'
import { MemoryRouter } from 'react-router-dom'
import { AdminSiteSettings, SettingField, DashboardProvider, readList, writeList } from '../dist/index.js'

const toast = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }))
vi.mock('react-hot-toast', () => ({ toast, default: toast }))
const feedback = vi.hoisted(() => ({ confirm: vi.fn() }))
vi.mock('@okjt/ui', async (importOriginal) => ({ ...(await importOriginal()), confirmAction: (...a) => feedback.confirm(...a) }))

const CATALOGUE = [
  { id: 'contact', title: 'Contact', description: 'On the Contact page.', sections: [{ title: 'How to reach you', fields: [
    { key: 'contact_email', store: 'contact', label: 'Email', type: 'email' },
    { key: 'contact_phone', store: 'contact', label: 'Phone', hint: 'With the country code.' },
  ] }] },
  { id: 'home', title: 'Home page', sections: [{ fields: [
    { key: 'hero_words', store: 'homepage', label: 'Rotating words', type: 'lines', item: 'word' },
    { key: 'show_banner', store: 'homepage', label: 'Show the banner', type: 'switch' },
  ] }] },
]

const STORED = [
  { key: 'contact_email', value: 'info@example.com', type: 'text', group: 'contact' },
  { key: 'hero_words', value: 'Fast, Simple', type: 'textarea', group: 'homepage' },
  { key: 'legacy_note', value: 'Old', type: 'text', group: 'general' },
]

function wrap(ui, api) {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>
        <DashboardProvider dashboard={{ api }}>
          <PermissionsProvider value={{ role: 'owner', isOwner: true, canEdit: true }}>{ui}</PermissionsProvider>
        </DashboardProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => { vi.clearAllMocks(); feedback.confirm.mockResolvedValue(true) })

describe('AdminSiteSettings (S6)', () => {
  it('shows the catalogue with stored values, and stored settings it does not list under Other', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: STORED } }) }
    wrap(<AdminSiteSettings catalogue={CATALOGUE} />, api)
    expect(await screen.findByLabelText('Email')).toHaveValue('info@example.com')
    expect(screen.getByText('With the country code.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Other · 1/ })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/admin/site-settings')
  })

  it('saves only what changed, with each setting\'s group and type, then says so', async () => {
    const api = {
      get: vi.fn().mockResolvedValue({ data: { data: STORED } }),
      put: vi.fn().mockResolvedValue({ data: { data: [...STORED, { key: 'contact_phone', value: '+254 700', type: 'text', group: 'contact' }] } }),
    }
    wrap(<AdminSiteSettings catalogue={CATALOGUE} />, api)
    fireEvent.change(await screen.findByLabelText('Phone'), { target: { value: '+254 700' } })
    expect(screen.getByText('You have unsaved changes.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/admin/site-settings', {
      settings: [{ key: 'contact_phone', value: '+254 700', type: 'text', group: 'contact' }],
    }))
    expect(await screen.findByText('All changes saved.')).toBeInTheDocument()
    expect(toast.success).toHaveBeenCalledWith('Settings saved. The website shows them now.')
  })

  it('stores a switch as 1 / 0 and asks before leaving a group with unsaved changes', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: STORED } }), put: vi.fn().mockResolvedValue({ data: {} }) }
    wrap(<AdminSiteSettings catalogue={CATALOGUE} />, api)
    fireEvent.click(await screen.findByRole('button', { name: /Home page/ }))
    const banner = screen.getByRole('switch', { name: 'Show the banner' })
    fireEvent.click(banner)
    expect(banner).toHaveAttribute('aria-checked', 'true')

    feedback.confirm.mockResolvedValueOnce(false)
    fireEvent.click(screen.getByRole('button', { name: /Contact/ }))
    await waitFor(() => expect(feedback.confirm).toHaveBeenCalledWith(expect.objectContaining({ title: 'Leave without saving?' })))
    expect(screen.getByRole('switch', { name: 'Show the banner' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/admin/site-settings', {
      settings: [{ key: 'show_banner', value: '1', type: 'boolean', group: 'homepage' }],
    }))
  })

  it('edits a list row by row and stores it as text', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: STORED } }), put: vi.fn().mockResolvedValue({ data: {} }) }
    wrap(<AdminSiteSettings catalogue={CATALOGUE} />, api)
    fireEvent.click(await screen.findByRole('button', { name: /Home page/ }))
    expect(screen.getByLabelText('Rotating words: word 1')).toHaveValue('Fast')
    fireEvent.click(screen.getByRole('button', { name: 'Remove word 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/admin/site-settings', {
      settings: [{ key: 'hero_words', value: 'Simple', type: 'textarea', group: 'homepage' }],
    }))
  })

  it('offers to try again when loading fails', async () => {
    const api = { get: vi.fn().mockRejectedValueOnce(new Error('500')).mockResolvedValue({ data: { data: STORED } }) }
    wrap(<AdminSiteSettings catalogue={CATALOGUE} />, api)
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(await screen.findByLabelText('Email')).toBeInTheDocument()
  })
})

describe('SettingField', () => {
  it('uploads an image into the media library and keeps its address', async () => {
    const api = { post: vi.fn().mockResolvedValue({ data: { data: [{ url: '/storage/logo.webp' }] } }) }
    const onChange = vi.fn()
    const { container } = wrap(<SettingField field={{ key: 'logo', label: 'Logo', type: 'image' }} value="" onChange={onChange} />, api)
    const input = container.querySelector('input[type="file"]')
    expect(input.getAttribute('accept')).not.toMatch(/video|svg/)
    fireEvent.change(input, { target: { files: [new File(['x'], 'logo.png', { type: 'image/png' })] } })
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('/storage/logo.webp'))
    expect(api.post.mock.calls[0][0]).toBe('/media')
  })

  it('draws a project\'s own field with custom', () => {
    wrap(<SettingField field={{ key: 'faq', type: 'custom', render: ({ value }) => <p>FAQ editor: {value}</p> }} value="3 answers" onChange={() => {}} />, {})
    expect(screen.getByText('FAQ editor: 3 answers')).toBeInTheDocument()
  })

  it('reads and writes lists as comma text or JSON', () => {
    expect(readList('a, b ,c')).toEqual(['a', 'b', 'c'])
    expect(writeList(['a', 'b'])).toBe('a, b')
    expect(readList('["x","y"]', 'json')).toEqual(['x', 'y'])
    expect(writeList(['x'], 'json')).toBe('["x"]')
  })
})
