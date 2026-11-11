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

