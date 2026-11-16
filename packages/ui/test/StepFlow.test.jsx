import { render, screen, within } from '@testing-library/react'
import { MapPin } from 'lucide-react'
import { StepFlow } from '../dist/index.js'

// F8, from TFE's StepFlow: one step indicator, inline in a wizard or docked at
// the bottom of a page, that shows progress only when there is some.
describe('StepFlow', () => {
  it('numbers the steps and marks done, current and to-do from a cursor', () => {
    const { container } = render(<StepFlow steps={['Details', { title: 'Where', icon: MapPin }, 'Confirm']} cursor={2} />)
    const items = container.querySelectorAll('ol > li')
    expect([...items].map((li) => li.dataset.state)).toEqual(['done', 'current', 'todo'])
    expect(items[1]).toHaveAttribute('aria-current', 'step')
    expect(items[1].querySelector('svg')).not.toBeNull()
    // A completion bar: one done + half of the current = 50%.
    expect(container.querySelector('[role=presentation] > div').style.width).toBe('50%')
  })

  it('explains a flow without claiming progress when nothing is tracked', () => {
    const { container } = render(<StepFlow steps={['Plan', 'Get a quote', 'Pay']} label="How it works" />)
    expect([...container.querySelectorAll('ol > li')].map((li) => li.dataset.state)).toEqual(['unstated', 'unstated', 'unstated'])
    expect(container.querySelector('[aria-current]')).toBeNull()
    expect(container.querySelector('[role=presentation]')).toBeNull()
    expect(screen.getByText('How it works')).toBeInTheDocument()
  })

  it('shows the current step and its place on phones', () => {
    const { container } = render(<StepFlow steps={['A', 'B', 'C', 'D']} cursor={3} />)
    const compact = container.querySelector('.sm\\:hidden')
    expect(within(compact).getByText('C')).toBeInTheDocument()
    expect(within(compact).getByText('Step 3 of 4')).toBeInTheDocument()
  })

  it('reads a finished flow as its last step, not its first', () => {
    const { container } = render(<StepFlow steps={['A', 'B']} cursor={9} />)
    expect(within(container.querySelector('.sm\\:hidden')).getByText('Step 2 of 2')).toBeInTheDocument()
  })

  it('docks to the bottom of the page, portalled and hidden until scrolled', () => {
    render(<div><StepFlow variant="docked" steps={['One', 'Two']} /></div>)
    const bar = document.body.querySelector(':scope > [data-variant=docked]')
    expect(bar).not.toBeNull()
    expect(bar).toHaveAttribute('aria-hidden', 'true')
    expect(bar.className).toContain('fixed')
  })

  it('renders nothing for no steps', () => {
    const { container } = render(<StepFlow steps={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
