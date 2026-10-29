import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PermissionsProvider } from '@okjt/ui'
import {
  DashboardProvider, CollaborationProvider, useCollaboration, CollaboratorAvatar, ShareModal, VersionHistoryDrawer,
  moduleForPathIn, initials,
} from '../dist/index.js'

const modules = [
  { key: 'dashboard', path: '/admin', label: 'Dashboard' },
  { key: 'expenses', path: '/admin/expenses', label: 'Expenses' },
]

function setup(api, { path = '/admin/expenses', role = 'owner', settings = {} } = {}) {
  return ({ children }) => (
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <PermissionsProvider value={{ role, isOwner: role === 'owner', canEdit: role !== 'viewer' }}>
          <DashboardProvider dashboard={{ api, modules, ...settings }}>{children}</DashboardProvider>
        </PermissionsProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

function Here() {
  const { module, othersHere, badges } = useCollaboration()
  return <p>{module}: {othersHere.map((p) => p.name).join(', ')} / {badges.expenses ?? 0}</p>
}

describe('working together', () => {
  it('finds the module of a path, longest match first', () => {
    expect(moduleForPathIn(modules, '/admin/expenses/12')?.key).toBe('expenses')
    expect(moduleForPathIn(modules, '/admin')?.key).toBe('dashboard')
    expect(initials('Amina Odhiambo')).toBe('AO')
  })

  it('reports the page it is on and shows who else is there', async () => {
    const api = { post: vi.fn(async () => ({ data: { presence: [{ id: 2, name: 'Bo', current_module: 'expenses' }], badges: { expenses: 3 } } })) }
    render(<CollaborationProvider><Here /></CollaborationProvider>, { wrapper: setup(api) })
    await waitFor(() => expect(screen.getByText('expenses: Bo / 3')).toBeInTheDocument())
    expect(api.post).toHaveBeenCalledWith('/collaboration/heartbeat', { module: 'expenses', path: '/admin/expenses' })
  })

  it("names a person's page from the project's modules", () => {
    render(<CollaboratorAvatar person={{ id: 1, name: 'Ann Lee', current_module: 'expenses' }} />, { wrapper: setup({}) })
    expect(screen.getByTitle('Ann Lee — on Expenses')).toHaveTextContent('AL')
  })

  it("lists collaborators and invites with the project's roles", async () => {
    const api = {
      get: vi.fn(async () => ({ data: [{ id: 1, name: 'Own Er', email: 'o@x.co', role: 'owner', is_you: true }] })),
      post: vi.fn(async () => ({ data: { invite_link: 'https://x.co/accept', emailed: true } })),
    }
    const roles = [{ value: 'owner', label: 'Lead', description: 'All' }, { value: 'viewer', label: 'Watcher', description: 'Look only' }]
    render(<ShareModal isOpen onClose={() => {}} />, { wrapper: setup(api, { settings: { roles, roleLabel: (r) => roles.find((x) => x.value === r)?.label } }) })
    await waitFor(() => expect(screen.getByText('Own Er')).toBeInTheDocument())
    expect(api.get).toHaveBeenCalledWith('/collaborators')
    expect(screen.getAllByText('Watcher').length).toBeGreaterThan(0)
  })

  it("shows changes made by nobody signed in under the project's name for them", async () => {
    const api = { get: vi.fn(async () => ({ data: { data: [{ id: 9, action: 'created', module: 'expenses', subject_label: 'Cement', changes: [], restorable: true, created_at: new Date().toISOString(), user: null }], current_page: 1, last_page: 1 } })) }
    render(<VersionHistoryDrawer module="expenses" onClose={() => {}} />, { wrapper: setup(api, { settings: { anonymousName: 'A visitor' } }) })
    await waitFor(() => expect(screen.getByText('A visitor')).toBeInTheDocument())
    expect(api.get).toHaveBeenCalledWith('/revisions', { params: { module: 'expenses', page: 1 } })
  })
})
