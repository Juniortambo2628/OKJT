import { render, screen, fireEvent, act } from '@testing-library/react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

const page = { url: '/hosts?tab=a' }
const visit = vi.fn()
vi.mock('@inertiajs/react', () => ({ usePage: () => page, router: { visit: (...a) => visit(...a) } }))

const { InertiaRouter } = await import('../dist/index.js')

// R3: inside InertiaRouter the kit's react-router pieces (Link, NavLink,
// useNavigate, useLocation, useSearchParams) work in an Inertia app.
function Kit() {
  const location = useLocation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  return (
    <div>
      <p>at {location.pathname}{location.search}{location.hash}, tab {params.get('tab')}</p>
      <Link to="/pricing?plan=pro">Pricing</Link>
      <Link to="#paths">Paths</Link>
      <Link to="https://wa.me/1">WhatsApp</Link>
      <NavLink to="/hosts" className={({ isActive }) => (isActive ? 'on' : 'off')}>Hosts</NavLink>
      <NavLink to="/events" className={({ isActive }) => (isActive ? 'on' : 'off')}>Events</NavLink>
      <button type="button" onClick={() => navigate('/events', { replace: true })}>Go</button>
    </div>
  )
}

beforeEach(() => {
  visit.mockClear()
  window.history.replaceState(null, '', '/hosts?tab=a')
})

describe('InertiaRouter', () => {
  it("gives the kit Inertia's current page as its location", () => {
    render(<InertiaRouter><Kit /></InertiaRouter>)
    expect(screen.getByText('at /hosts?tab=a, tab a')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hosts' })).toHaveClass('on')
    expect(screen.getByRole('link', { name: 'Events' })).toHaveClass('off')
  })

  it('turns a link to another page into an Inertia visit, with the visit options', () => {
    render(<InertiaRouter visitOptions={{ preserveScroll: true }}><Kit /></InertiaRouter>)
    const link = screen.getByRole('link', { name: 'Pricing' })
    expect(link).toHaveAttribute('href', '/pricing?plan=pro')
    fireEvent.click(link)
    expect(visit).toHaveBeenCalledWith('/pricing?plan=pro', { preserveScroll: true, replace: false })
  })

  it('turns navigate() into a visit, replace kept', () => {
    render(<InertiaRouter><Kit /></InertiaRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(visit).toHaveBeenCalledWith('/events', { replace: true })
  })

  it('stays on the page for a #section, and follows the new hash', () => {
    page.url = '/hosts'
    window.history.replaceState(null, '', '/hosts')
    try {
      render(<InertiaRouter><Kit /></InertiaRouter>)
      act(() => { fireEvent.click(screen.getByRole('link', { name: 'Paths' })) })
      expect(visit).not.toHaveBeenCalled()
      expect(window.location.hash).toBe('#paths')
      expect(screen.getByText('at /hosts#paths, tab')).toBeInTheDocument()
    } finally {
      page.url = '/hosts?tab=a'
    }
  })

  it("follows react-router: a bare #section link drops the page's query", () => {
    // react-router resolves to="#paths" against the path alone, so on
    // /hosts?tab=a it means /hosts#paths: another address, so a visit.
    render(<InertiaRouter><Kit /></InertiaRouter>)
    expect(screen.getByRole('link', { name: 'Paths' })).toHaveAttribute('href', '/hosts#paths')
  })

  it('leaves links to other sites as plain links', () => {
    render(<InertiaRouter><Kit /></InertiaRouter>)
    expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', 'https://wa.me/1')
  })
})
