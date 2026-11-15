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

  it('runs an item written with onClick, as with onSelect', () => {
    const onClick = vi.fn()
    const onClose = vi.fn()
    render(<ContextMenu position={{ x: 0, y: 0 }} items={[{ label: 'Rename', onClick }]} onClose={onClose} />)
    fireEvent.click(screen.getByRole('menuitem', { name: /Rename/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalled()
  })

  it('warns in development when an item has nothing to run', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<ContextMenu position={{ x: 0, y: 0 }} items={[{ label: 'Nothing here', action: vi.fn() }]} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('menuitem', { name: /Nothing here/ }))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Nothing here'))
    warn.mockRestore()
  })

  it('gives focus back to what opened it when it closes', () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    const items = [{ label: 'Copy', onSelect: vi.fn() }]
    const { rerender } = render(<ContextMenu position={{ x: 0, y: 0 }} items={items} onClose={vi.fn()} />)
    expect(screen.getByRole('menuitem', { name: /Copy/ })).toHaveFocus()
    rerender(<ContextMenu position={null} items={items} onClose={vi.fn()} />)
    expect(opener).toHaveFocus()
    opener.remove()
  })

  it('leaves focus where the chosen item put it', () => {
    const opener = document.createElement('button')
    const dialogField = document.createElement('input')
    document.body.append(opener, dialogField)
    opener.focus()
    const items = [{ label: 'Edit', onSelect: vi.fn() }]
    const { rerender } = render(<ContextMenu position={{ x: 0, y: 0 }} items={items} onClose={vi.fn()} />)
    dialogField.focus()
    rerender(<ContextMenu position={null} items={items} onClose={vi.fn()} />)
    expect(dialogField).toHaveFocus()
    opener.remove(); dialogField.remove()
  })
})
