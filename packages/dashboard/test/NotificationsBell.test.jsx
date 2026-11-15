import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotificationsBell, DashboardProvider } from '../dist/index.js'

const items = () => [
  { id: 'a', title: 'Receipt read', message: 'Ksh 2,500', read_at: null, created_at: new Date().toISOString() },
  { id: 'b', title: 'Invited', message: 'to Kitengela', read_at: null, created_at: new Date().toISOString() },
]
// A server that remembers what was marked read.
const apiWith = (list = items()) => ({
  get: vi.fn(async () => ({ data: list.map((n) => ({ ...n })) })),
  post: vi.fn(async (path) => {
    for (const n of list) if (path.includes(`/${n.id}`)) n.read_at = new Date().toISOString()
    return {}
  }),
})
const renderBell = (api, props = {}) => render(
  <MemoryRouter><DashboardProvider dashboard={{ api }}><NotificationsBell {...props} /><p>Outside</p></DashboardProvider></MemoryRouter>
)

describe('NotificationsBell', () => {
  it('closes on a click outside and on Escape', async () => {
    renderBell(apiWith())
    const bell = await screen.findByRole('button', { name: 'Notifications, 2 unread' })
    fireEvent.click(bell)
    expect(screen.getByText('Receipt read')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByText('Outside'))
    await waitFor(() => expect(screen.queryByText('Receipt read')).toBeNull())
    fireEvent.click(bell)
    expect(screen.getByText('Receipt read')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByText('Receipt read')).toBeNull())
  })

  it('draws the project\'s own button and panel on the kit\'s behaviour, and marks one read', async () => {
    const api = apiWith()
    renderBell(api, {
      markOnePath: '/notifications/:id/read',
      renderButton: ({ toggle, unreadCount }) => <button type="button" onClick={toggle}>House bell {unreadCount}</button>,
      renderPanel: ({ notifications, markRead, close }) => (
        <ul aria-label="House panel">
          {notifications.filter((n) => !n.read_at).map((n) => <li key={n.id}>{n.title}<button type="button" onClick={() => markRead(n.id)}>Read {n.id}</button></li>)}
          <li><button type="button" onClick={close}>Close</button></li>
        </ul>
      ),
    })
    fireEvent.click(await screen.findByRole('button', { name: 'House bell 2' }))
    expect(screen.getByRole('list', { name: 'House panel' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Read a' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/notifications/a/read'))
    expect(await screen.findByRole('button', { name: 'House bell 1' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('list', { name: 'House panel' })).toBeNull()
  })

  it('takes markOnePath as a function', async () => {
    const api = apiWith()
    renderBell(api, {
      markOnePath: (id) => `/inbox/${id}`,
      renderButton: ({ toggle }) => <button type="button" onClick={toggle}>Bell</button>,
      renderPanel: ({ markRead }) => <button type="button" onClick={() => markRead('b')}>Read b</button>,
    })
    fireEvent.click(await screen.findByRole('button', { name: 'Bell' }))
    fireEvent.click(screen.getByRole('button', { name: 'Read b' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/inbox/b'))
  })
})
