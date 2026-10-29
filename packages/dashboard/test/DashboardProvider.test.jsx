import { render, screen, act, renderHook } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardProvider, AdminPageHero, AdminPageLayout, useAdminAction } from '../dist/index.js'

const panel = { id: 'help', title: 'Help', content: <div>Help panel</div>, mobile: false }

describe('DashboardProvider', () => {
  it('puts the dashboard home first in every breadcrumb', () => {
    render(
      <BrowserRouter>
        <DashboardProvider dashboard={{ home: { label: 'Overview', path: '/app' } }}>
          <AdminPageHero title="Projects" breadcrumb="Projects" />
        </DashboardProvider>
      </BrowserRouter>,
    )
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/app')
  })

  it('gives pages without a panel the default panel, and none without one', () => {
    const page = <AdminPageLayout hero={<div />}><p>Body</p></AdminPageLayout>
    const { unmount } = render(<DashboardProvider dashboard={{ useDefaultPanel: () => panel }}>{page}</DashboardProvider>)
    expect(screen.getByText('Help panel')).toBeInTheDocument()
    unmount()
    render(page)
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.queryByText('Help panel')).toBeNull()
  })

  it('calls the after-change hook once a save succeeds', async () => {
    const afterChange = vi.fn()
    const wrapper = ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        <DashboardProvider dashboard={{ useAfterChange: () => afterChange }}>{children}</DashboardProvider>
      </QueryClientProvider>
    )
    const { result } = renderHook(() => useAdminAction(async () => 'ok'), { wrapper })
    await act(() => result.current.run('x'))
    expect(afterChange).toHaveBeenCalledTimes(1)
  })
})
