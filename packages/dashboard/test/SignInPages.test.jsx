import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Settings } from 'lucide-react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider, SignInPage, GoogleCallbackPage, AcceptInvitePage, AccountMenu, AuthLayout, VerifyEmailPage, ForgotPasswordPage, ResetPasswordPage, ConfirmPasswordPage } from '../dist/index.js'

const renderWith = (api, ui, path = '/', mode) => render(
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter initialEntries={[path]}><AuthProvider api={api} mode={mode}>{ui}</AuthProvider></MemoryRouter>
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
    const api = { get: vi.fn(), post: vi.fn(async (url) => ({ data: url === '/login' ? { requires_2fa: true, email: 'ann@x.co', challenge: 'C1' } : { token: 'T', user: { id: 1 } } })) }
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
    expect(api.post).toHaveBeenLastCalledWith('/verify-2fa', { challenge: 'C1', code: '123456' })
  })

  it('takes a recovery code instead of the app\'s code', async () => {
    const api = { get: vi.fn(), post: vi.fn(async (url) => ({ data: url === '/login' ? { requires_2fa: true, email: 'ann@x.co', challenge: 'C2' } : { user: { id: 1 } } })) }
    const onSignedIn = vi.fn()
    renderWith(api, <SignInPage onSignedIn={onSignedIn} />)

    fill('Email', 'ann@x.co')
    fill('Password', 'secret1')
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Use a recovery code instead' }))
    fill('Recovery code', ' abcdefghij-klmnopqrst ')
    fireEvent.click(screen.getByRole('button', { name: 'Verify & sign in' }))
    await waitFor(() => expect(onSignedIn).toHaveBeenCalled())
    expect(api.post).toHaveBeenLastCalledWith('/verify-2fa', { challenge: 'C2', code: 'abcdefghij-klmnopqrst' })
  })

  it('remembers the person when asked, and links to the forgotten-password page', async () => {
    const api = { get: vi.fn(), post: vi.fn(async () => ({ data: { user: { id: 1 } } })) }
    renderWith(api, <SignInPage remember forgotHint={<a href="/forgot-password">Forgot password?</a>} />, '/', 'session')

    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/forgot-password')
    fill('Email', 'ann@x.co')
    fill('Password', 'secret1')
    fireEvent.click(screen.getByLabelText('Remember me'))
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/login', { email: 'ann@x.co', password: 'secret1', remember: true }))
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('signs in with a code sent by email', async () => {
    const api = {
      get: vi.fn(),
      post: vi.fn(async (url) => (url === '/login-code'
        ? { message: 'If that address exists, a sign-in code is on its way.', data: { email: 'ann@x.co' } }
        : { data: { user: { id: 1 } } })),
    }
    const onSignedIn = vi.fn()
    renderWith(api, <SignInPage emailCode onSignedIn={onSignedIn} passkey={false} />, '/', 'session')

    fireEvent.click(screen.getByRole('button', { name: 'Email me a sign-in code instead' }))
    expect(screen.queryByLabelText('Password')).toBeNull()
    fill('Email', 'ann@x.co')
    fireEvent.click(screen.getByRole('button', { name: 'Email me a code' }))
    expect(await screen.findByRole('status')).toHaveTextContent('a sign-in code is on its way')
    expect(api.post).toHaveBeenCalledWith('/login-code', { email: 'ann@x.co' })

    fill('Sign-in code', '12x3456')
    expect(screen.getByLabelText('Sign-in code')).toHaveValue('123456')
    fireEvent.click(screen.getByRole('button', { name: 'Verify & sign in' }))
    await waitFor(() => expect(onSignedIn).toHaveBeenCalled())
    expect(api.post).toHaveBeenLastCalledWith('/login-code/verify', { email: 'ann@x.co', code: '123456' })
  })

  it('shows a refused code', async () => {
    const refusal = Object.assign(new Error('no'), { response: { data: { message: 'The given data was invalid.', errors: { code: ['That sign-in code is invalid or expired.'] } } } })
    const api = { get: vi.fn(), post: vi.fn(async (url) => { if (url === '/login-code') return { data: {} }; throw refusal }) }
    renderWith(api, <SignInPage emailCode passkey={false} />)

    fireEvent.click(screen.getByRole('button', { name: 'Email me a sign-in code instead' }))
    fill('Email', 'ann@x.co')
    fireEvent.click(screen.getByRole('button', { name: 'Email me a code' }))
    await screen.findByLabelText('Sign-in code')
    fill('Sign-in code', '000000')
    fireEvent.click(screen.getByRole('button', { name: 'Verify & sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('That sign-in code is invalid or expired.')
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

describe('ForgotPasswordPage', () => {
  it('sends the link and says so', async () => {
    const api = { get: vi.fn(), post: vi.fn(async () => ({ message: 'If that address has an account, a reset link is on its way.', data: null })) }
    renderWith(api, <ForgotPasswordPage />)
    fill('Email', 'ann@x.co')
    fireEvent.click(screen.getByRole('button', { name: 'Email me a reset link' }))
    expect(await screen.findByRole('status')).toHaveTextContent('a reset link is on its way')
    expect(api.post).toHaveBeenCalledWith('/forgot-password', { email: 'ann@x.co' })
  })
})

describe('ResetPasswordPage', () => {
  it('takes the token and address from the link, needs matching passwords, and resets', async () => {
    const api = { get: vi.fn(), post: vi.fn(async () => ({ message: 'Your password has been reset.', data: null })) }
    const onReset = vi.fn()
    renderWith(api, <Routes><Route path="/reset-password/:token" element={<ResetPasswordPage onReset={onReset} />} /></Routes>, '/reset-password/tok1?email=ann@x.co')

    expect(screen.getByLabelText('Email')).toHaveValue('ann@x.co')
    fill('New password', 'longenough1')
    fill('Confirm password', 'other')
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }))
    expect(await screen.findByText('The passwords don’t match.')).toBeInTheDocument()

    fill('Confirm password', 'longenough1')
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }))
    await waitFor(() => expect(onReset).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Your password has been reset.' })))
    expect(api.post).toHaveBeenCalledWith('/reset-password', { token: 'tok1', email: 'ann@x.co', password: 'longenough1', password_confirmation: 'longenough1' })
  })

  it('shows the server\'s refusal on its field', async () => {
    const refusal = Object.assign(new Error('no'), { response: { data: { message: 'x', errors: { email: ['This password reset token is invalid.'] } } } })
    const api = { get: vi.fn(), post: vi.fn(async () => { throw refusal }) }
    renderWith(api, <ResetPasswordPage token="t" email="ann@x.co" />)
    fill('New password', 'longenough1')
    fill('Confirm password', 'longenough1')
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }))
    expect(await screen.findByText('This password reset token is invalid.')).toBeInTheDocument()
  })
})

describe('ConfirmPasswordPage', () => {
  it('checks the password, then carries on', async () => {
    const refusal = Object.assign(new Error('no'), { response: { data: { message: 'x', errors: { password: ['The provided password is incorrect.'] } } } })
    const api = { get: vi.fn(), post: vi.fn(async (url, body) => { if (body.password !== 'right') throw refusal; return { data: { confirmed: true } } }) }
    const onConfirmed = vi.fn()
    renderWith(api, <ConfirmPasswordPage onConfirmed={onConfirmed} />)

    fill('Password', 'wrong')
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('The provided password is incorrect.')
    fill('Password', 'right')
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await waitFor(() => expect(onConfirmed).toHaveBeenCalled())
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

describe('VerifyEmailPage', () => {
  it('sends the emailed link\'s id, hash, expiry and signature, and signs the person in', async () => {
    const api = { get: vi.fn(), post: vi.fn(async () => ({ data: { token: 'T', user: { id: 4 }, email_verified: true } })) }
    renderWith(api, <Routes><Route path="/verify-email/:id/:hash" element={<VerifyEmailPage />} /></Routes>, '/verify-email/4/abc123?expires=1793519285&signature=f00d')

    expect(await screen.findByText('Email verified')).toBeInTheDocument()
    expect(api.post).toHaveBeenCalledWith('/email/verify', { id: '4', hash: 'abc123', expires: '1793519285', signature: 'f00d' })
    expect(localStorage.getItem('auth_token')).toBe('T')
  })

  it('shows the server\'s refusal', async () => {
    const api = { get: vi.fn(), post: vi.fn(async () => { throw Object.assign(new Error('no'), { response: { data: { message: 'This verification link has expired — sign in and we\'ll send a new one.', reason: 'expired' } } }) }) }
    renderWith(api, <Routes><Route path="/verify-email/:id/:hash" element={<VerifyEmailPage />} /></Routes>, '/verify-email/4/abc123?expires=1&signature=f00d')

    expect(await screen.findByRole('alert')).toHaveTextContent('has expired')
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
