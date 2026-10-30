import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Settings } from 'lucide-react'
import { AuthProvider, SignInPage, GoogleCallbackPage, AcceptInvitePage, AccountMenu, AuthLayout } from '../dist/index.js'

const renderWith = (api, ui, path = '/') => render(
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter initialEntries={[path]}><AuthProvider api={api}>{ui}</AuthProvider></MemoryRouter>
  </QueryClientProvider>,
)
const fill = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

beforeEach(() => localStorage.clear())

describe('SignInPage', () => {
  it('signs in and hands the answer on; a message it returns is shown', async () => {
    const api = { get: vi.fn(), post: vi.fn(async () => ({ data: { token: 'T', user: { id: 1, name: 'Ann' }, projects: [] } })) }
    const onSignedIn = vi.fn(() => 'You have no access here.')
    renderWith(api, <SignInPage onSignedIn={onSignedIn} forgotHint="Ask an owner." />)

    expect(screen.getByText('Ask an owner.')).toBeInTheDocument()
    fill('Email', 'ann@x.co')
    fill('Password', 'secret1')
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith({ success: true, projects: [] }))
    expect(await screen.findByRole('alert')).toHaveTextContent('You have no access here.')
  })

  it('asks for the two-step code, then signs in with it', async () => {
    const api = { get: vi.fn(), post: vi.fn(async (url) => ({ data: url === '/login' ? { requires_2fa: true, email: 'ann@x.co' } : { token: 'T', user: { id: 1 } } })) }
    const onSignedIn = vi.fn()
    renderWith(api, <SignInPage onSignedIn={onSignedIn} />)

    fill('Email', 'ann@x.co')
    fill('Password', 'secret1')
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Two-step verification')).toBeInTheDocument()

    fill('Verification code', '12a3456')
    expect(screen.getByLabelText('Verification code')).toHaveValue('123456')
    fireEvent.click(screen.getByRole('button', { name: 'Verify & sign in' }))
    await waitFor(() => expect(onSignedIn).toHaveBeenCalled())
    expect(api.post).toHaveBeenLastCalledWith('/verify-2fa', { email: 'ann@x.co', code: '123456' })
  })

  it('asks an unverified person to verify, and can resend the email', async () => {
    const api = { get: vi.fn(), post: vi.fn(async (url) => ({ data: url === '/login' ? { requires_verification: true, email: 'bo@x.co' } : {} })) }
    renderWith(api, <SignInPage />)

    fill('Email', 'bo@x.co')
    fill('Password', 'secret1')
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Verify your email')).toBeInTheDocument()
    expect(screen.getByText('bo@x.co')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Resend the email' }))
    expect(await screen.findByText(/Sent — check your inbox/)).toBeInTheDocument()
  })

  it('checks the fields before asking the server', async () => {
    const api = { get: vi.fn(), post: vi.fn() }
    renderWith(api, <SignInPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })
})

describe('GoogleCallbackPage', () => {
  it('says so when the code is missing', () => {
    renderWith({ get: vi.fn(), post: vi.fn() }, <GoogleCallbackPage signInPath="/login" />, '/auth/google')
    expect(screen.getByRole('alert')).toHaveTextContent('Missing sign-in code')
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute('href', '/login')
  })

  it('swaps the code for a token and hands the answer on', async () => {
    const api = { get: vi.fn(), post: vi.fn(async () => ({ data: { token: 'T', user: { id: 1 }, projects: [1] } })) }
    const onSignedIn = vi.fn()
    renderWith(api, <GoogleCallbackPage onSignedIn={onSignedIn} />, '/auth/google?code=abc')

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith(expect.objectContaining({ success: true, projects: [1] })))
    expect(api.post).toHaveBeenCalledWith('/auth/google', { code: 'abc' })
    expect(localStorage.getItem('auth_token')).toBe('T')
  })
})

describe('AcceptInvitePage', () => {
  it('needs matching passwords, then signs the new person in', async () => {
    const accept = vi.fn(async () => ({ token: 'T', user: { id: 3, name: 'Cy' }, projects: [9] }))
    const onSignedIn = vi.fn()
    renderWith({ get: vi.fn(), post: vi.fn() }, <AcceptInvitePage accept={accept} onSignedIn={onSignedIn} />, '/accept-invite?email=cy@x.co&token=tok')

    expect(screen.getByLabelText('Email')).toHaveValue('cy@x.co')
    fill('Password', 'longenough1')
    fill('Confirm password', 'different1')
    fireEvent.submit(screen.getByLabelText('Password').closest('form'))
    expect(await screen.findByRole('alert')).toHaveTextContent('The passwords don’t match.')

    fill('Confirm password', 'longenough1')
    fireEvent.submit(screen.getByLabelText('Password').closest('form'))
    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith({ success: true, projects: [9] }))
    expect(accept).toHaveBeenCalledWith({ email: 'cy@x.co', token: 'tok', password: 'longenough1', password_confirmation: 'longenough1' })
    expect(localStorage.getItem('auth_token')).toBe('T')
  })

  it('says when the link is incomplete', () => {
    renderWith({ get: vi.fn(), post: vi.fn() }, <AcceptInvitePage accept={vi.fn()} />, '/accept-invite')
    expect(screen.getByRole('alert')).toHaveTextContent('This invitation link is incomplete.')
  })
})

describe('AuthLayout', () => {
  it('shows the brand, the way back and the panel only when given', () => {
    const { rerender } = render(<MemoryRouter><AuthLayout title="Hi" /></MemoryRouter>)
    expect(screen.queryByLabelText('Back to the home page')).toBeNull()
    expect(screen.getByRole('link', { name: 'Back to the website' })).toBeInTheDocument()

    rerender(<MemoryRouter><AuthLayout title="Hi" brand={<span>Logo</span>} backLabel="Back home" aside={<aside>Panel</aside>} /></MemoryRouter>)
    expect(screen.getByLabelText('Back to the home page')).toHaveTextContent('Logo')
    expect(screen.getByRole('link', { name: 'Back home' })).toBeInTheDocument()
    expect(screen.getByText('Panel')).toBeInTheDocument()
  })
})

describe('AccountMenu', () => {
  it('shows who is signed in, the project’s entries and account pages, and logs out', async () => {
    localStorage.setItem('auth_token', 'T')
    const api = { get: vi.fn(async () => ({ data: { id: 1, name: 'Ann Lee', email: 'ann@x.co' } })), post: vi.fn(async () => ({ data: null })) }
    renderWith(api, <AccountMenu
      roleText="Owner"
      links={[{ path: '/settings', icon: Settings, label: 'Settings', id: 'menu-settings' }]}
      extra={({ itemClass }) => <a href="/billing" role="menuitem" className={itemClass}>Billing</a>}
    />)

    const button = await screen.findByRole('button', { name: 'Account menu for Ann Lee' })
    expect(button).toHaveTextContent('A')
    fireEvent.click(button)

    expect(await screen.findByRole('menu')).toHaveTextContent('ann@x.co')
    expect(screen.getByText('Owner')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Billing' })).toHaveAttribute('href', '/billing')
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute('id', 'menu-settings')

    fireEvent.click(screen.getByRole('menuitem', { name: 'Log out' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/logout'))
  })
})
