import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '../dist/index.js'

describe('Modal', () => {
  it('shows its content with a close button that calls onClose', () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} label="Edit">Body</Modal>)
    expect(screen.getByRole('dialog', { name: 'Edit' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('leaves out its close button with showClose={false}, for content that has its own', () => {
    render(<Modal open onClose={vi.fn()} showClose={false}>Body</Modal>)
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('takes widths up to 7xl and extra classes for the panel', () => {
    render(<Modal open onClose={vi.fn()} maxWidth="7xl" className="bg-surface">Body</Modal>)
    const panel = screen.getByText('Body')
    expect(panel.className).toContain('bg-surface')
    expect(panel.parentElement.className).toContain('max-w-7xl')
  })

  it('renders nothing while closed', () => {
    render(<Modal open={false} onClose={vi.fn()}>Body</Modal>)
    expect(screen.queryByText('Body')).toBeNull()
  })
})
