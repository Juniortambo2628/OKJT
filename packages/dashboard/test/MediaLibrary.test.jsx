import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PermissionsProvider } from '@okjt/ui'
import { AdminMediaLibrary, MediaPicker, DashboardProvider } from '../dist/index.js'

const toast = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }))
vi.mock('react-hot-toast', () => ({ toast, default: toast }))
const feedback = vi.hoisted(() => ({ confirm: vi.fn() }))
vi.mock('@okjt/ui', async (importOriginal) => ({ ...(await importOriginal()), confirmAction: (...a) => feedback.confirm(...a) }))

const ASSETS = [
  { id: 1, url: '/storage/a.webp', name: 'pool.webp', kind: 'image', size: 204800, width: 1920, height: 1080 },
  { id: 2, url: '/storage/b.mp4', name: 'tour.mp4', kind: 'video', size: 3145728, width: null, height: null },
]

function wrap(ui, api) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <DashboardProvider dashboard={{ api }}>
        <PermissionsProvider value={{ role: 'owner', isOwner: true, canEdit: true }}>{ui}</PermissionsProvider>
      </DashboardProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => { vi.clearAllMocks(); feedback.confirm.mockResolvedValue(true) })

describe('AdminMediaLibrary (S5)', () => {
  it('lists the files with their sizes and the total', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: { assets: ASSETS, stats: { total: 2, bytes: 3350528 } } } }) }
    wrap(<AdminMediaLibrary />, api)
    expect(await screen.findByText('pool.webp')).toBeInTheDocument()
    expect(screen.getByText('200 KB · 1920×1080')).toBeInTheDocument()
    expect(screen.getByText('3.0 MB')).toBeInTheDocument()
    expect(screen.getByText('2 files, 3.2 MB')).toBeInTheDocument()
  })

  it('uploads the chosen files as files[] and reloads', async () => {
    const api = {
      get: vi.fn().mockResolvedValueOnce({ data: { data: { assets: [], stats: { total: 0 } } } }).mockResolvedValue({ data: { data: { assets: ASSETS.slice(0, 1), stats: { total: 1 } } } }),
      post: vi.fn().mockResolvedValue({ data: { message: 'Uploaded' } }),
    }
    wrap(<AdminMediaLibrary />, api)
    await screen.findByText('No photos or videos yet.')
    const input = screen.getByLabelText('Upload photos or videos')
    expect(input).toHaveAttribute('accept', expect.stringContaining('image/webp'))
    expect(input.getAttribute('accept')).not.toMatch(/svg/)
    fireEvent.change(input, { target: { files: [new File(['x'], 'pool.webp', { type: 'image/webp' })] } })
    await waitFor(() => expect(api.post).toHaveBeenCalled())
    const [url, form] = api.post.mock.calls[0]
    expect(url).toBe('/media')
    expect(form.getAll('files[]')[0].name).toBe('pool.webp')
    expect(await screen.findByText('pool.webp')).toBeInTheDocument()
    expect(toast.success).toHaveBeenCalledWith('Uploaded')
  })

  it('asks before deleting, then deletes and reloads', async () => {
    const api = {
      get: vi.fn().mockResolvedValueOnce({ data: { data: { assets: ASSETS, stats: {} } } }).mockResolvedValue({ data: { data: { assets: ASSETS.slice(1), stats: {} } } }),
      delete: vi.fn().mockResolvedValue({}),
    }
    wrap(<AdminMediaLibrary />, api)
    fireEvent.click(await screen.findByRole('button', { name: 'Delete pool.webp' }))
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/media/1'))
    expect(feedback.confirm).toHaveBeenCalledWith(expect.objectContaining({ title: 'Delete "pool.webp"?', tone: 'danger' }))
    await waitFor(() => expect(screen.queryByText('pool.webp')).toBeNull())
  })
})

describe('MediaPicker (S5)', () => {
  it('asks for images only, and hands back the chosen asset', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: { assets: ASSETS.slice(0, 1) } } }) }
    const onPick = vi.fn()
    const onClose = vi.fn()
    wrap(<MediaPicker open onClose={onClose} onPick={onPick} />, api)
    const dialog = await screen.findByRole('dialog', { name: 'Media library' })
    fireEvent.click(await within(dialog).findByRole('button', { name: /pool\.webp/ }))
    expect(api.get).toHaveBeenCalledWith('/media', { params: { kind: 'image' } })
    expect(onPick).toHaveBeenCalledWith(ASSETS[0])
    expect(onClose).toHaveBeenCalled()
  })

  it('says when the library is empty', async () => {
    const api = { get: vi.fn().mockResolvedValue({ data: { data: { assets: [] } } }) }
    wrap(<MediaPicker open onClose={() => {}} onPick={() => {}} kind={null} />, api)
    expect(await screen.findByText(/The library is empty/)).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/media', { params: {} })
  })
})
