import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  AdminFloatingToolbar, AdminPageHero, AdminSummaryCards, DashboardProvider, EmptyState,
  SidePanelAside, countActiveFilterLists,
} from '../dist/index.js'

const Fa = ({ className = '' }) => <i data-testid="project-icon" className={className} />
const withKit = (ui, dashboard = {}) => render(
  <MemoryRouter>
    <DashboardProvider dashboard={{ iconFor: (name) => (name.startsWith('fa-') ? Fa : null), ...dashboard }}>{ui}</DashboardProvider>
  </MemoryRouter>,
)

describe('icons by name and component defaults', () => {
  it('draws a named icon with the project’s iconFor, and the kit’s own when it has none', () => {
    withKit(<EmptyState variant="card" icon="fa-folder" title="No files yet" message="Upload one." />)
    expect(screen.getByTestId('project-icon')).toHaveClass('text-2xl')
    expect(screen.getByRole('heading', { name: 'No files yet' })).toBeInTheDocument()
  })

  it('takes a project’s default variant, which a page can still override', () => {
    withKit(<EmptyState title="Nothing" message="Still nothing." />, { componentDefaults: { EmptyState: { variant: 'card' } } })
    expect(screen.getByRole('heading', { name: 'Nothing' })).toBeInTheDocument()
  })
})

describe('EmptyState, card', () => {
  it('says what a search narrowed to nothing and offers to clear it', () => {
    const onClear = vi.fn()
    withKit(<EmptyState variant="card" title="No expenses" search="cement" filtered noun="expense" onClear={onClear} />)
    expect(screen.getByRole('heading', { name: 'No expenses match “cement”' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear search and filters' }))
    expect(onClear).toHaveBeenCalled()
  })
})

describe('AdminSummaryCards, bold', () => {
  it('shows each figure with its label, hint and trend; a card with onClick is a pressed-state button', () => {
    const onClick = vi.fn()
    withKit(<AdminSummaryCards variant="bold" cards={[
      { label: 'Total spend', value: 'Ksh 197,500', icon: 'fa-receipt', trend: -12, hint: 'This month' },
      { label: 'Missing receipts', value: 6, icon: 'fa-file', onClick, active: true },
    ]} />)
    expect(screen.getByText('Ksh 197,500')).toBeInTheDocument()
    expect(screen.getByText('12%')).toBeInTheDocument()
    expect(screen.getByText('This month')).toBeInTheDocument()
    const button = screen.getByRole('button', { name: /Missing receipts/ })
    expect(button).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })
})

describe('AdminPageHero, bold', () => {
  it('shows the breadcrumbs as given, the subtitle and the page actions', () => {
    withKit(<AdminPageHero variant="bold" title="Upload" subtitle="Photos from site"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Photos', href: '/photos' }, { label: 'Upload' }]}
      actions={<button type="button">Pick files</button>} />)
    expect(screen.getByRole('heading', { name: 'Upload' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Photos' })).toHaveAttribute('href', '/photos')
    expect(screen.getByText('Photos from site')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pick files' })).toBeInTheDocument()
  })
})

describe('AdminFloatingToolbar, bold', () => {
  it('puts the first two actions beside search and filters and the rest under More', () => {
    withKit(<AdminFloatingToolbar variant="bold"
      search={{ value: '', onChange: () => {} }}
      filters={[{ name: 'sort', label: 'Sort', value: 'new', onChange: () => {}, options: [{ value: 'new', label: 'Newest' }, { value: 'old', label: 'Oldest' }] }]}
      actions={[1, 2, 3].map((n) => ({ id: `a${n}`, label: `Action ${n}`, icon: 'fa-pen', onClick: () => {} }))} />)
    expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Action 3' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
    expect(screen.getByRole('button', { name: 'Action 3' })).toBeInTheDocument()
  })

  it('shows the selection and its actions instead while rows are selected', () => {
    withKit(<AdminFloatingToolbar variant="bold" actions={[{ id: 'new', label: 'New', onClick: () => {} }]}
      selection={{ count: 2, total: 6, onSelectAll: () => {}, onDeselectAll: () => {}, actions: [{ id: 'del', label: 'Delete selected', variant: 'danger', onClick: () => {} }] }} />)
    expect(screen.getByText('2 selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select all 6' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete selected' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New' })).not.toBeInTheDocument()
  })

  it('counts filters set away from their default', () => {
    expect(countActiveFilterLists([
      { value: 'new', options: [{ value: 'new' }] },
      { value: 'paid', defaultValue: 'all', options: [{ value: 'all' }, { value: 'paid' }] },
    ])).toBe(1)
  })
})

describe('Side panel, bold', () => {
  it('shows the sections with their counts beside the label, and marks the current one', () => {
    withKit(<SidePanelAside panel={{ title: 'Spending', icon: 'fa-wallet', activeId: 'all', onChange: () => {},
      items: [{ id: 'all', label: 'All expenses', icon: 'fa-layer-group', count: 6 }, { id: 'missing', label: 'Missing a receipt', count: 2, group: 'Receipts' }] }} />,
    { componentDefaults: { SidePanel: { variant: 'bold' } } })
    expect(screen.getByRole('button', { name: /All expenses/ })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('Receipts')).toHaveClass('capitalize')
    expect(screen.getByText('6')).toBeInTheDocument()
  })
})
