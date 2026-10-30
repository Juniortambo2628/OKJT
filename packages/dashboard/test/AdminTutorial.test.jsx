import { render, act } from '@testing-library/react'
import { AdminTutorial } from '../dist/index.js'

describe('AdminTutorial', () => {
  afterEach(() => vi.useRealTimers())

  it('shows nothing without steps, even on a first visit', () => {
    vi.useFakeTimers()
    localStorage.removeItem('admin-tutorial-complete')
    const { container } = render(<AdminTutorial steps={[]} />)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(container).toBeEmptyDOMElement()
  })

  it('opens on a first visit when it has steps', () => {
    vi.useFakeTimers()
    localStorage.removeItem('admin-tutorial-complete')
    const { getByText } = render(<AdminTutorial steps={[{ title: 'Welcome', content: 'A quick tour.', target: 'nowhere', position: 'bottom' }]} />)
    act(() => { vi.advanceTimersByTime(1500) })
    expect(getByText('Welcome')).toBeInTheDocument()
  })
})
