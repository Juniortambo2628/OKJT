import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PermissionsProvider } from '@okjt/ui'
import { AdminPagePhotos, DashboardProvider } from '../dist/index.js'

const toast = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }))
vi.mock('react-hot-toast', () => ({ toast, default: toast }))
const feedback = vi.hoisted(() => ({ confirm: vi.fn() }))
vi.mock('@okjt/ui', async (importOriginal) => ({ ...(await importOriginal()), confirmAction: (...a) => feedback.confirm(...a) }))

const PLACES = [
  { key: 'homeHero', label: 'Home page, top', hint: 'Wide', defaults: ['couple-1'] },
  { key: 'storyCard', label: 'Our story card', defaults: ['couple-2'] },
]
const BUILT_IN = { 'couple-1': '/img/c1.webp', 'couple-2': '/img/c2.webp', 'couple-3': '/img/c3.webp' }
const READ = { data: { data: { placements: { storyCard: ['media-7', 'couple-3'] }, media: { 'media-7': { id: 7, url: '/storage/garden.webp', name: 'garden.webp' } } } } }

function wrap(api, props = {}) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <DashboardProvider dashboard={{ api }}>
        <PermissionsProvider value={{ role: 'owner', isOwner: true, canEdit: true }}>
          <AdminPagePhotos places={PLACES} builtIn={BUILT_IN} {...props} />
        </PermissionsProvider>
      </DashboardProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => { vi.clearAllMocks(); feedback.confirm.mockResolvedValue(true) })

describe('AdminPagePhotos (S6, step 3)', () => {
  it('shows each place with its original picture or the chosen ones', async () => {
    wrap({ get: vi.fn().mockResolvedValue(READ) })
    expect(await screen.findByText('The original picture · Wide')).toBeInTheDocument()
    expect(screen.getByText('2 chosen pictures')).toBeInTheDocument()
    const story = screen.getByRole('list', { name: 'Our story card: pictures' })
    expect(within(story).getAllByRole('img').map((i) => i.getAttribute('src'))).toEqual(['/storage/garden.webp', '/img/c3.webp'])
    expect(within(story).getByRole('img', { name: 'garden.webp' })).toBeInTheDocument()
  })

  it('adds a built-in photo, reorders, and saves the refs in order', async () => {
    const api = { get: vi.fn().mockResolvedValue(READ), put: vi.fn().mockResolvedValue({ data: {} }) }
    wrap(api)
    fireEvent.click((await screen.findAllByRole('button', { name: 'Change' }))[0])
    fireEvent.click(screen.getByRole('button', { name: 'Add couple-3' }))
    fireEvent.click(screen.getByRole('button', { name: 'Move picture 2 up' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/admin/page-photos/homeHero', { images: ['couple-3', 'couple-1'] }))
    expect(toast.success).toHaveBeenCalledWith('Picture changed. The site shows it now.')
  })

  it('picks from the media library as a media ref', async () => {
    const api = {
      get: vi.fn().mockImplementation((url) => Promise.resolve(url === '/media' ? { data: { data: { assets: [{ id: 9, url: '/storage/pool.webp', name: 'pool.webp', kind: 'image' }] } } } : READ)),
      put: vi.fn().mockResolvedValue({ data: {} }),
    }
    wrap(api)
    fireEvent.click((await screen.findAllByRole('button', { name: 'Change' }))[0])
    fireEvent.click(screen.getByRole('button', { name: 'From the media library' }))
    fireEvent.click(await screen.findByRole('button', { name: /pool\.webp/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/admin/page-photos/homeHero', { images: ['couple-1', 'media-9'] }))
  })

  it('needs at least one picture, and puts a place back to its original after asking', async () => {
    const api = { get: vi.fn().mockResolvedValue(READ), delete: vi.fn().mockResolvedValue({ data: {} }) }
    wrap(api)
    fireEvent.click((await screen.findAllByRole('button', { name: 'Change' }))[0])
    fireEvent.click(screen.getByRole('button', { name: 'Remove picture 1' }))
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    fireEvent.click(screen.getByRole('button', { name: 'Back to the original' }))
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/admin/page-photos/storyCard'))
    expect(feedback.confirm).toHaveBeenCalledWith(expect.objectContaining({ title: 'Put "Our story card" back to its original picture?' }))
  })
})
