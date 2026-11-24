import { render, screen } from '@testing-library/react'
import { AdminCard } from '../dist/index.js'

describe('AdminCard', () => {
  it('renders children', () => {
    render(<AdminCard><p>Card content</p></AdminCard>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<AdminCard className="custom-class"><p>Content</p></AdminCard>)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders with title', () => {
    render(<AdminCard><h2>Title</h2></AdminCard>)
    expect(screen.getByText('Title')).toBeInTheDocument()
  })
})
