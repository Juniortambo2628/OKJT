import { render, screen, fireEvent } from '@testing-library/react'
import { ContextMenu } from '../dist/index.js'

describe('ContextMenu', () => {
  it('renders nothing when closed', () => {
    render(<ContextMenu position={null} items={[{ label: 'Copy', onSelect: vi.fn() }]} onClose={vi.fn()} />)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('runs an item and closes', () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()
    render(<ContextMenu position={{ x: 10, y: 10 }} items={[{ type: 'header', label: 'Text' }, { label: 'Duplicate', onSelect }]} onClose={onClose} />)
    expect(screen.getByText('Text')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('menuitem', { name: /Duplicate/ }))
    expect(onSelect).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('opens a submenu and keeps open for keepOpen items', () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()
    render(
      <ContextMenu
        position={{ x: 10, y: 10 }}
        items={[{ label: 'Font', submenu: [{ label: 'Larger', keepOpen: true, onSelect }, { label: 'Italic', checked: true, onSelect: vi.fn() }] }]}
        onClose={onClose}
      />
    )
    fireEvent.click(screen.getByRole('menuitem', { name: /Font/ }))
    expect(screen.getByRole('menuitemcheckbox', { name: /Italic/ })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(screen.getByRole('menuitem', { name: /Larger/ }))
    expect(onSelect).toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    render(<ContextMenu position={{ x: 0, y: 0 }} items={[{ label: 'A', onSelect: vi.fn() }]} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('gives focus back to what opened it when it closes', () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    const items = [{ label: 'Copy', onSelect: vi.fn() }]
    const { rerender } = render(<ContextMenu position={{ x: 10, y: 10 }} items={items} onClose={vi.fn()} />)
    expect(screen.getByRole('menuitem', { name: /Copy/ })).toHaveFocus()
    rerender(<ContextMenu position={null} items={items} onClose={vi.fn()} />)
    expect(opener).toHaveFocus()
    opener.remove()
  })

  it('leaves focus where an item put it (a dialog it opened, say)', () => {
    const opener = document.createElement('button')
    const field = document.createElement('input')
    document.body.append(opener, field)
    opener.focus()
    const items = [{ label: 'Rename', onSelect: () => field.focus() }]
    const { rerender } = render(<ContextMenu position={{ x: 10, y: 10 }} items={items} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('menuitem', { name: /Rename/ }))
    rerender(<ContextMenu position={null} items={items} onClose={vi.fn()} />)
    expect(field).toHaveFocus()
    opener.remove()
    field.remove()
  })
})

