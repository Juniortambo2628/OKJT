import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Home, Ticket, Receipt } from 'lucide-react'
import { DashboardProvider, DashboardShell, sidebarActivePath } from '../dist/index.js'

// From TFE (kit migration phase 4): a ticketing partner's sidebar has
// Tickets (/partner/tickets) and Sales (/partner/tickets/sales). On Sales,
// both were marked current, because each item matched on its own prefix.
// The sidebar now marks one item: the longest match, with the same rule as
// before for which items can match (the home item only on itself).
const NAV = [
  { items: [{ label: 'Home', icon: Home, path: '/app' }] },
  { items: [
    { label: 'Tickets', icon: Ticket, path: '/app/tickets' },
    { label: 'Sales', icon: Receipt, path: '/app/tickets/sales' },
  ] },
]

describe('sidebarActivePath (pure)', () => {
  it('marks the longest matching item only', () => {
    expect(sidebarActivePath(NAV, '/app/tickets/sales', '/app')).toBe('/app/tickets/sales')
    expect(sidebarActivePath(NAV, '/app/tickets', '/app')).toBe('/app/tickets')
    expect(sidebarActivePath(NAV, '/app/tickets/7', '/app')).toBe('/app/tickets')
  })

  it('keeps the home item to its own page, as before', () => {
    expect(sidebarActivePath(NAV, '/app', '/app')).toBe('/app')
    expect(sidebarActivePath(NAV, '/app/settings', '/app')).toBeNull()
  })
})

function renderShell(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={new QueryClient()}>
        <DashboardProvider dashboard={{ home: { label: 'Home', path: '/app' }, shell: { logo: { src: '/l.png', alt: 'Logo', to: '/app' }, nav: NAV } }}>
          <DashboardShell><p>Page</p></DashboardShell>
        </DashboardProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('DashboardSidebar current item', () => {
  it('marks one item on a nested page', () => {
    renderShell('/app/tickets/sales')
    const current = within(screen.getByRole('navigation', { name: 'Main' })).getAllByRole('link').filter((a) => a.getAttribute('aria-current') === 'page')
    expect(current.map((a) => a.textContent)).toEqual(['Sales'])
  })
})
