import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Home, Calculator, Ticket, Receipt, Inbox } from 'lucide-react'
import { DashboardProvider, DashboardShell, AdminFloatingToolbar, tabBarItems, activeNavItem } from '../dist/index.js'

// F5, lifted from TFE (lib/dashboardTabs.js + tests/JS/dashboardTabs.test.mjs):
// tabs are picked from the sidebar by path, so they can't drift from it.
const NAV = [
  { items: [{ label: 'Home', icon: Home, path: '/app' }] },
  { title: 'Plan & book', items: [
    { label: 'Plan a Trip', icon: Calculator, path: '/app/plan' },
    { label: 'Tickets', icon: Ticket, path: '/app/tickets' },
    { label: 'My purchases', icon: Receipt, path: '/app/tickets/purchases' },
  ] },
]

describe('tab bar items (pure)', () => {
  it('takes the longest matching nav path as current', () => {
    expect(activeNavItem(NAV, '/app/tickets/purchases?x=1').path).toBe('/app/tickets/purchases')
    expect(activeNavItem(NAV, '/app/tickets/7').path).toBe('/app/tickets')
    expect(activeNavItem(NAV, '/app/ticketsx').path).toBe('/app')
    expect(activeNavItem([{ items: [{ path: '/app/tickets' }] }], '/app/ticketsx')).toBeNull()
  })

  it('picks tabs from the nav, in tab order, with its labels and icons', () => {
    const tabs = tabBarItems(NAV, ['/app', { path: '/app/plan', primary: true, label: 'Plan' }, '/app/tickets'], '/app/tickets')
    expect(tabs.map((t) => t.path)).toEqual(['/app', '/app/plan', '/app/tickets'])
    expect(tabs[0].icon).toBe(Home)
    expect(tabs[1].label).toBe('Plan')
    expect(tabs[1].primary).toBe(true)
    expect(tabs.map((t) => t.current)).toEqual([false, false, true])
  })

  it('leaves out a tab whose path is not in this nav, rather than drawing a dead tab', () => {
    expect(tabBarItems(NAV, ['/app', '/partner/requests'], '/app').map((t) => t.path)).toEqual(['/app'])
  })
})

const api = { post: vi.fn(async () => ({ data: { presence: [], badges: { inbox: 3 } } })), get: vi.fn(async () => ({ data: [] })) }
const nav = [...NAV, { items: [{ label: 'Inbox', icon: Inbox, path: '/app/inbox' }] }]

function renderShell(path, tabBar, page = <p>Page</p>) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={new QueryClient()}>
        <DashboardProvider dashboard={{ api, modules: [{ key: 'inbox', path: '/app/inbox', label: 'Inbox' }], home: { label: 'Home', path: '/app' }, shell: { logo: { src: '/l.png', alt: 'Logo', to: '/app' }, nav, tabBar } }}>
          <DashboardShell>{page}</DashboardShell>
        </DashboardProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('DashboardShell shell.tabBar', () => {
  it('draws no tab bar by default', () => {
    renderShell('/app', undefined)
    expect(screen.queryByRole('navigation', { name: 'Tabs' })).toBeNull()
    expect(document.documentElement.style.getPropertyValue('--okjt-tabbar-h')).toBe('')
  })

  it('draws the chosen sidebar items as tabs, the current one marked, and a Menu tab', () => {
    renderShell('/app/tickets/7', { tabs: ['/app', { path: '/app/plan', primary: true, label: 'Plan' }, '/app/tickets', '/nowhere'] })
    const bar = screen.getByRole('navigation', { name: 'Tabs' })
    expect(bar.className).toContain('lg:hidden')
    expect(bar.parentElement).toBe(document.body)
    const links = bar.querySelectorAll('a')
    expect([...links].map((a) => a.getAttribute('href'))).toEqual(['/app', '/app/plan', '/app/tickets'])
    expect(links[1]).toHaveTextContent('Plan')
    expect(links[1].className).toContain('ring-accent/40')
    expect(links[2]).toHaveAttribute('aria-current', 'page')
    expect(document.documentElement.style.getPropertyValue('--okjt-tabbar-h')).toContain('76px')
  })

  it('opens the sidebar from the Menu tab, and can leave it out', () => {
    const { unmount } = renderShell('/app', { tabs: ['/app'] })
    const menu = screen.getByRole('button', { name: 'Menu' })
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(menu)
    expect(menu).toHaveAttribute('aria-expanded', 'true')
    unmount()
    renderShell('/app', { tabs: ['/app'], menu: false })
    expect(screen.queryByRole('button', { name: 'Menu' })).toBeNull()
  })

  it('shows a dot on a tab whose page has changes by others', async () => {
    renderShell('/app', { tabs: ['/app', '/app/inbox'] })
    const bar = screen.getByRole('navigation', { name: 'Tabs' })
    expect(await within(bar).findByRole('link', { name: 'Inbox, 3 new' })).toBeInTheDocument()
  })

  it('lifts the floating toolbar above the bar, and leaves it where it was without one', () => {
    const toolbar = <AdminFloatingToolbar actions={[{ id: 'add', label: 'Add', onClick: () => {} }]} />
    const { unmount } = renderShell('/app', undefined, toolbar)
    const wrapperOf = () => screen.getByRole('button', { name: 'Add' }).closest('.fixed')
    expect(wrapperOf().className).toContain('bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6')
    unmount()
    renderShell('/app', { tabs: ['/app'] }, toolbar)
    expect(wrapperOf().className).toContain('bottom-[calc(var(--okjt-tabbar-h,0px)+0.75rem)] lg:bottom-6')
  })
})
