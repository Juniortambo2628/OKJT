import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PermissionsProvider } from '@okjt/ui'
import { MemoryRouter } from 'react-router-dom'
import { AdminPageCopy, DashboardProvider } from '../dist/index.js'

const toast = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }))
vi.mock('react-hot-toast', () => ({ toast, default: toast }))
const feedback = vi.hoisted(() => ({ confirm: vi.fn() }))
vi.mock('@okjt/ui', async (importOriginal) => ({ ...(await importOriginal()), confirmAction: (...a) => feedback.confirm(...a) }))

const SECTIONS = [
  { key: 'hero', label: 'Hero', visible: true, fields: [
    { path: 'title', label: 'Title', default: 'Plan the trip', value: null, multiline: false },
    { path: 'subtitle', label: 'Subtitle', default: 'Matches, stays and flights in one place, for every fan who travels.', value: 'Edited', multiline: true },
  ] },
  { key: 'faq', label: 'Faq', visible: false, fields: [{ path: 'items.0.q', label: 'Items › #1 › question', default: 'Is it free?', value: null, multiline: false }] },
]

function wrap(api, props = {}) {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>
        <DashboardProvider dashboard={{ api }}>
          <PermissionsProvider value={{ role: 'owner', isOwner: true, canEdit: true }}><AdminPageCopy {...props} /></PermissionsProvider>
        </DashboardProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => { vi.clearAllMocks(); feedback.confirm.mockResolvedValue(true) })

describe('AdminPageCopy (S6, step 2)', () => {
  it('shows each text with the original as its placeholder, and says what has changed', async () => {
    wrap({ get: vi.fn().mockResolvedValue({ data: { data: SECTIONS } }) })
    const title = await screen.findByLabelText('Title')
    expect(title).toHaveValue('')
    expect(title).toHaveAttribute('placeholder', 'Plan the trip')
    expect(screen.getByLabelText('Subtitle')).toHaveValue('Edited')
    expect(screen.getByText(/1 of 2 changed from the original/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Faq \(hidden\)/ })).toBeInTheDocument()
  })

  it('saves only the changed text of the section', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: SECTIONS } }), put: vi.fn().mockResolvedValue({ data: { data: { ...SECTIONS[0], fields: [{ ...SECTIONS[0].fields[0], value: 'Your trip' }, SECTIONS[0].fields[1]] } } }) }
    wrap(api)
    fireEvent.change(await screen.findByLabelText('Title'), { target: { value: 'Your trip' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/admin/page-copy/hero', { fields: { title: 'Your trip' } }))
    expect(await screen.findByText(/2 of 2 changed/)).toBeInTheDocument()
  })

  it('shows or hides a section straight away', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: SECTIONS } }), put: vi.fn().mockResolvedValue({ data: { data: { ...SECTIONS[0], visible: false } } }) }
    wrap(api)
    fireEvent.click(await screen.findByRole('switch', { name: 'Show on the site' }))
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/admin/page-copy/hero', { visible: false }))
    expect(await screen.findByRole('button', { name: /Hero \(hidden\)/ })).toBeInTheDocument()
  })

  it('asks, then puts a section back to the original', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: SECTIONS } }), delete: vi.fn().mockResolvedValue({ data: { data: { ...SECTIONS[0], fields: SECTIONS[0].fields.map((f) => ({ ...f, value: null })) } } }) }
    wrap(api)
    fireEvent.click(await screen.findByRole('button', { name: 'Back to the original' }))
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/admin/page-copy/hero'))
    expect(feedback.confirm).toHaveBeenCalledWith(expect.objectContaining({ title: 'Put "Hero" back to the original wording?' }))
    expect(await screen.findByText(/The original wording\./)).toBeInTheDocument()
  })

  it('uses a project\'s own section names', async () => {
    wrap({ get: vi.fn().mockResolvedValue({ data: { data: SECTIONS } }) }, { sectionLabel: (k) => ({ hero: 'Top of the home page' })[k] })
    expect(await screen.findByRole('heading', { name: 'Top of the home page' })).toBeInTheDocument()
  })
})
