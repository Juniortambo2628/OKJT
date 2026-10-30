import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth, DashboardProvider, NotificationsBell } from '../dist/index.js'

let auth
function Probe() { auth = useAuth(); return <p>{auth.isAuthenticated ? `in as ${auth.user.name}` : 'out'}</p> }

const wrap = (api, extend) => ({ children }) => (
  <QueryClientProvider client={new QueryClient()}><AuthProvider api={api} extend={extend}>{children}</AuthProvider></QueryClientProvider>
)

beforeEach(() => localStorage.clear())

describe('AuthProvider', () => {
  it('signs in, keeps what the server adds on the user, and signs out', async () => {
    const api = {
      get: vi.fn(),
      post: vi.fn(async (url) => (url === '/login'
        ? { data: { token: 'T1', user: { id: 1, name: 'Ann' }, projects: [{ id: 7 }] } }
        : { data: null })),
    }
    render(<Probe />, { wrapper: wrap(api, (value) => ({ projects: value.user?.projects || [] })) })
    await waitFor(() => expect(screen.getByText('out')).toBeInTheDocument())

    let result
    await act(async () => { result = await auth.login('ann@x.co', 'pw') })
    expect(result).toEqual({ success: true, projects: [{ id: 7 }] })
    expect(localStorage.getItem('auth_token')).toBe('T1')
    expect(screen.getByText('in as Ann')).toBeInTheDocument()
    expect(auth.projects).toEqual([{ id: 7 }])

    await act(async () => { await auth.logout() })
    expect(api.post).toHaveBeenCalledWith('/logout')
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(auth.signedOut).toBe(true)
  })

  it('passes on the two-step and unverified answers without signing in', async () => {
    const answers = { a: { requires_2fa: true, email: 'a@x.co' }, b: { requires_verification: true, email: 'b@x.co' } }
    const api = { get: vi.fn(), post: vi.fn(async (url, body) => ({ data: answers[body.email[0]] })) }
    render(<Probe />, { wrapper: wrap(api) })
    let r
    await act(async () => { r = await auth.login('a@x.co', 'pw') })
    expect(r).toMatchObject({ success: true, requires_2fa: true })
    await act(async () => { r = await auth.login('b@x.co', 'pw') })
    expect(r).toMatchObject({ success: false, requires_verification: true, email: 'b@x.co' })
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('restores the session from a stored token', async () => {
    localStorage.setItem('auth_token', 'T2')
    const api = { get: vi.fn(async () => ({ data: { id: 2, name: 'Bo' } })), post: vi.fn() }
    render(<Probe />, { wrapper: wrap(api) })
    await waitFor(() => expect(screen.getByText('in as Bo')).toBeInTheDocument())
    expect(api.get).toHaveBeenCalledWith('/user')
  })
})

describe('NotificationsBell', () => {
  it('shows the latest notifications and marks them read', async () => {
    const api = {
      get: vi.fn(async () => ({ data: [{ id: 'n1', title: 'Gift claimed', message: 'Ann took the kettle', icon: 'gift', read_at: null, created_at: new Date().toISOString() }] })),
      post: vi.fn(async () => ({})),
    }
    render(<MemoryRouter><DashboardProvider dashboard={{ api }}><NotificationsBell /></DashboardProvider></MemoryRouter>)
    const bell = await screen.findByRole('button', { name: 'Notifications, 1 unread' })
    fireEvent.click(bell)
    expect(screen.getByText('Gift claimed')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mark all read' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/notifications/mark-read'))
  })
})
