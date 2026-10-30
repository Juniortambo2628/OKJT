import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Wallet, PieChart } from 'lucide-react'
import { DashboardProvider, DashboardShell } from '../dist/index.js'

const api = { post: vi.fn(async () => ({ data: { presence: [], badges: { expenses: 2 } } })), get: vi.fn(async () => ({ data: [] })) }
const shell = {
  logo: { src: '/logo.png', alt: 'Najenga', to: '/' },
  nav: [{ title: 'Money', items: [{ path: '/app/expenses', icon: Wallet, label: 'Expenses', id: 'sidebar-expenses' }] }],
  quickLinks: [{ path: '/app/analytics', icon: PieChart, label: 'Analytics', id: 'header-analytics' }],
  Banner: () => <div>Not published yet</div>,
  Notifications: () => <button type="button">Bell</button>,
  AccountMenu: ({ compactLinks }) => <div>Account ({compactLinks.length} links)</div>,
}

function renderShell(path = '/app/expenses') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={new QueryClient()}>
        <DashboardProvider dashboard={{ api, modules: [{ key: 'expenses', path: '/app/expenses', label: 'Expenses' }], home: { label: 'Home', path: '/app' }, shell }}>
          <DashboardShell><p>Page body</p></DashboardShell>
        </DashboardProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('DashboardShell', () => {
  it("frames the page with the project's sidebar, header and slots", async () => {
    renderShell()
    expect(screen.getByText('Page body')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Najenga' })).toHaveAttribute('src', '/logo.png')
    expect(screen.getByText('Money')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Expenses' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Analytics' })).toHaveAttribute('href', '/app/analytics')
    expect(screen.getByText('Not published yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bell' })).toBeInTheDocument()
    expect(screen.getByText('Account (1 links)')).toBeInTheDocument()
    expect(document.documentElement).toHaveClass('admin-theme')
  })

  it('works with no shell settings at all', () => {
    render(<MemoryRouter><DashboardShell><p>Bare</p></DashboardShell></MemoryRouter>, {
      wrapper: ({ children }) => <QueryClientProvider client={new QueryClient()}><DashboardProvider dashboard={{ api }}>{children}</DashboardProvider></QueryClientProvider>,
    })
    expect(screen.getByText('Bare')).toBeInTheDocument()
  })
})
