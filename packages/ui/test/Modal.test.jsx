import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '../dist/index.js'

describe('Modal', () => {
  it('keeps the transparent panel and floating close button by default', () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} label="Preview"><div>Body</div></Modal>)
    const dialog = screen.getByRole('dialog', { name: 'Preview' })
    expect(dialog.querySelector('h2')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('offers the wider sizes', () => {
    render(<Modal open onClose={vi.fn()} maxWidth="7xl" label="Receipt">x</Modal>)
    expect(screen.getByRole('dialog').querySelector('.max-w-7xl')).not.toBeNull()
  })

  it('draws no close button when showClose is false', () => {
    render(<Modal open onClose={vi.fn()} showClose={false} label="Own header">x</Modal>)
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('becomes a card with a title, description and footer', () => {
    render(
      <Modal open onClose={vi.fn()} title="Edit expense" description="Changes save when you press Save" footer={<button type="button">Save</button>}>
        <p>Fields</p>
      </Modal>
    )
    const dialog = screen.getByRole('dialog', { name: 'Edit expense' })
    expect(dialog).toHaveTextContent('Changes save when you press Save')
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(1)
  })

  it('ignores Escape, the backdrop and has no close button when not closeable', () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} closeable={false} title="Finish this step">x</Modal>)
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('closes on Escape when closeable', () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="T">x</Modal>)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
