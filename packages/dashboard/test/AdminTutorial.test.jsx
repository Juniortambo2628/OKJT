import { render, act, screen } from '@testing-library/react'
import { AdminTutorial } from '../dist/index.js'

describe('AdminTutorial', () => {
  // jsdom doesn't lay out or scroll.
  beforeAll(() => { Element.prototype.scrollIntoView ??= () => {} })
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

  it('controlled: shows while open, starts at step one, keys move and Escape completes', async () => {
    localStorage.removeItem('admin-tutorial-complete')
    const onComplete = vi.fn()
    const steps = [{ title: 'One', content: 'a' }, { title: 'Two', content: 'b' }]
    const { getByText, queryByText, rerender } = render(<AdminTutorial open={false} steps={steps} onComplete={onComplete} />)
    expect(queryByText('One')).toBeNull()
    rerender(<AdminTutorial open steps={steps} onComplete={onComplete} />)
    expect(screen.getByRole('dialog', { name: 'One' })).toBeInTheDocument()
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })) })
    expect(screen.getByRole('button', { name: /Finish Tour/ })).toBeInTheDocument()
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })) })
    expect(await screen.findByText('One')).toBeInTheDocument()
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })) })
    expect(onComplete).toHaveBeenCalledTimes(1)
    // The app remembers who has finished; the browser flag is left alone.
    expect(localStorage.getItem('admin-tutorial-complete')).toBeNull()
  })

  it('skipMissing leaves out steps whose element is not on screen, and finds selectors', () => {
    const here = document.createElement('div')
    here.setAttribute('data-tour', 'search')
    here.getBoundingClientRect = () => ({ top: 10, left: 10, right: 110, bottom: 40, width: 100, height: 30 })
    document.body.appendChild(here)
    const steps = [
      { title: 'Sidebar', content: 'gone on phones', selector: '[data-tour="sidebar"]' },
      { title: 'Search', content: 'here', selector: '[data-tour="search"]' },
    ]
    const { getByText, queryByText } = render(<AdminTutorial open skipMissing steps={steps} />)
    expect(queryByText('Sidebar')).toBeNull()
    expect(getByText('Search')).toBeInTheDocument()
    here.remove()
  })

  it('render draws the whole tour on the kit\'s behaviour, without scrolling', async () => {
    const here = document.createElement('div')
    here.setAttribute('data-tour', 'bell')
    here.getBoundingClientRect = () => ({ top: 10, left: 900, right: 940, bottom: 50, width: 40, height: 40 })
    here.scrollIntoView = vi.fn()
    document.body.appendChild(here)
    const onComplete = vi.fn()
    const steps = [{ title: 'Welcome', body: 'Hello' }, { title: 'Bell', body: 'News here', selector: '[data-tour="bell"]' }]
    render(
      <AdminTutorial open skipMissing scrollIntoView={false} steps={steps} onComplete={onComplete}
        render={({ step, index, count, rect, next, back, finish }) => (
          <div role="dialog" aria-label={step.title}>
            <p>{index + 1} of {count}</p>
            <p>{rect ? `at ${rect.left}` : 'centred'}</p>
            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={index === count - 1 ? finish : next}>{index === count - 1 ? 'Done' : 'Next'}</button>
          </div>
        )} />
    )
    expect(screen.getByRole('dialog', { name: 'Welcome' })).toHaveTextContent('1 of 2')
    act(() => { screen.getByRole('button', { name: 'Next' }).click() })
    expect(screen.getByRole('dialog', { name: 'Bell' })).toBeInTheDocument()
    expect(await screen.findByText('at 900')).toBeInTheDocument()
    expect(here.scrollIntoView).not.toHaveBeenCalled()
    act(() => { screen.getByRole('button', { name: 'Done' }).click() })
    expect(onComplete).toHaveBeenCalledTimes(1)
    here.remove()
  })

  it('→ stops at the last step; finishing takes the card\'s button', async () => {
    const onComplete = vi.fn()
    const steps = [{ title: 'One', content: 'a' }, { title: 'Two', content: 'b' }]
    render(<AdminTutorial open steps={steps} onComplete={onComplete} />)
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })) })
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })) })
    expect(onComplete).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Finish Tour/ })).toBeInTheDocument()
  })
})

