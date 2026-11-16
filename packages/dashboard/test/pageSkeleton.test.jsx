import { lazy } from 'react'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import { DashboardProvider, DashboardShell, skeletonVariantFor, DEFAULT_SKELETON_PATTERNS } from '../dist/index.js'

// F9, lifted from TFE (lib/pageSkeleton.js + tests/JS/pageSkeleton.test.mjs):
// a page still loading is known only by its path, so the placeholder's shape
// comes from the path; the wrong shape makes the real page jump when it lands.
describe('skeletonVariantFor (pure)', () => {
  it('gives account and edit pages the form-beside-preview shape', () => {
    for (const path of ['/app/profile', '/app/security', '/app/settings', '/app/expenses/12/edit', '/app/projects/new']) {
      expect(skeletonVariantFor(path), path).toBe('split')
    }
  })

  it('gives lists the table shape, browse pages cards, number pages the dashboard', () => {
    expect(skeletonVariantFor('/app/users')).toBe('table')
    expect(skeletonVariantFor('/app/messages')).toBe('table')
    expect(skeletonVariantFor('/app/media')).toBe('cards')
    expect(skeletonVariantFor('/app/projects')).toBe('cards')
    expect(skeletonVariantFor('/app/analytics')).toBe('dashboard')
  })

  it('falls back to the dashboard shape, or the given fallback', () => {
    expect(skeletonVariantFor('/something/entirely/different')).toBe('dashboard')
    expect(skeletonVariantFor('/something', [], 'cards')).toBe('cards')
  })

  it('reads a full href, a query string, a URL object and nothing alike', () => {
    expect(skeletonVariantFor('https://example.com/app/users?page=2')).toBe(skeletonVariantFor('/app/users'))
    expect(skeletonVariantFor('/app/profile?tab=bio')).toBe('split')
    expect(skeletonVariantFor(new URL('http://localhost/app/media'))).toBe('cards')
    for (const nothing of [undefined, null, '']) expect(skeletonVariantFor(nothing)).toBe('dashboard')
  })

  it("takes a project's own patterns, first match wins", () => {
    const patterns = [[/\/guests(\/|$)/, 'table'], ...DEFAULT_SKELETON_PATTERNS]
    expect(skeletonVariantFor('/app/guests', patterns)).toBe('table')
    expect(skeletonVariantFor('/app/guests', DEFAULT_SKELETON_PATTERNS)).toBe('dashboard')
  })
})

const api = { post: vi.fn(async () => ({ data: { presence: [], badges: {} } })), get: vi.fn(async () => ({ data: [] })) }
const Never = lazy(() => new Promise(() => {}))

function renderShell(pageSkeleton) {
  return render(
    <MemoryRouter initialEntries={['/app/users']}>
      <QueryClientProvider client={new QueryClient()}>
        <Suspense fallback={<p>Whole app loading</p>}>
          <DashboardProvider dashboard={{ api, home: { label: 'Home', path: '/app' }, shell: { logo: { src: '/l.png', alt: 'Logo', to: '/app' }, nav: [], pageSkeleton } }}>
            <DashboardShell><Never /></DashboardShell>
          </DashboardProvider>
        </Suspense>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('DashboardShell shell.pageSkeleton', () => {
  it('leaves a loading page to the boundary above the shell by default', () => {
    renderShell(undefined)
    expect(screen.getByText('Whole app loading')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Logo' })).toBeNull()
  })

  it('keeps the sidebar and header, and shows the shape after the grace period', () => {
    vi.useFakeTimers()
    try {
      renderShell(true)
      expect(screen.queryByText('Whole app loading')).toBeNull()
      expect(screen.getByRole('img', { name: 'Logo' })).toBeInTheDocument()
      expect(screen.queryByRole('status')).toBeNull()
      act(() => { vi.advanceTimersByTime(220) })
      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-busy', 'true')
      expect(status).toHaveAttribute('data-skeleton', 'table')
    } finally {
      vi.useRealTimers()
    }
  })

  it("takes the project's patterns and grace", () => {
    renderShell({ patterns: [[/\/users$/, 'cards']], grace: 0 })
    expect(screen.getByRole('status')).toHaveAttribute('data-skeleton', 'cards')
  })
})
