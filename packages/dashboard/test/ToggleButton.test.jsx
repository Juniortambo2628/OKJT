import { render, screen, fireEvent } from '@testing-library/react'
import { ToggleButton } from '../dist/index.js'

describe('ToggleButton', () => {
  it('renders in off state', () => {
    const { container } = render(<ToggleButton enabled={false} onToggle={() => {}} />)
    const track = container.firstChild
    expect(track).toHaveClass('bg-tone-200')
  })

  it('renders in on state', () => {
    const { container } = render(<ToggleButton enabled={true} onToggle={() => {}} />)
    const track = container.firstChild
    expect(track).toHaveClass('bg-accent')
  })

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn()
    render(<ToggleButton enabled={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
