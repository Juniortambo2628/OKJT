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

  // From OKJT#44 (Najenga's gaps): className, closed, keyboard focus.
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

  it('moves focus in, keeps Tab inside, and gives it back on close', () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    const { rerender } = render(
      <Modal open onClose={vi.fn()} showClose={false}><input aria-label="Name" /><button>Save</button></Modal>
    )
    const name = screen.getByRole('textbox', { name: 'Name' })
    const save = screen.getByRole('button', { name: 'Save' })
    expect(name).toHaveFocus()
    save.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(name).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(save).toHaveFocus()
    rerender(<Modal open={false} onClose={vi.fn()} showClose={false}><input aria-label="Name" /></Modal>)
    return new Promise((resolve) => setTimeout(() => { expect(opener).toHaveFocus(); opener.remove(); resolve() }, 600))
  })

  it('leaves Tab alone inside a dialog opened on top of it', () => {
    render(<Modal open onClose={vi.fn()} showClose={false}><button>Under</button></Modal>)
    const top = document.createElement('div')
    top.setAttribute('aria-modal', 'true')
    const yes = document.createElement('button')
    top.appendChild(yes)
    document.body.appendChild(top)
    yes.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(yes).toHaveFocus()
    top.remove()
  })
})
