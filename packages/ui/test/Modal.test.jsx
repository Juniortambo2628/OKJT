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

  it('takes a project\'s own overlay, backdrop, panel and body classes', () => {
    render(
      <Modal open onClose={vi.fn()} showClose={false} label="House"
        overlayClassName="house-overlay" backdropClassName="house-backdrop"
        classNames={{ panel: 'house-panel', body: 'house-body' }}>
        <p>Body</p>
      </Modal>
    )
    const overlay = screen.getByRole('dialog', { name: 'House' })
    expect(overlay.className).toBe('fixed inset-0 house-backdrop house-overlay')
    const body = screen.getByText('Body').parentElement
    expect(body.className).toBe('house-body')
    expect(body.parentElement.className).toBe('house-panel')
  })

  it('keeps its own classes when none are given', () => {
    render(<Modal open onClose={vi.fn()} label="Plain" maxWidth="md"><p>Body</p></Modal>)
    const overlay = screen.getByRole('dialog', { name: 'Plain' })
    expect(overlay.className).toBe('fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto')
    const body = screen.getByText('Body').parentElement
    expect(body.className).toBe('max-h-[88vh] overflow-y-auto rounded-2xl')
    expect(body.parentElement.className).toBe('relative w-full max-w-md my-auto outline-none')
  })

  // F2: tabs, a footer per tab, a fixed height and a phone sheet (from TFE's TfeModal).
  it('keeps the card\'s own classes when none of the F2 options are used', () => {
    render(<Modal open onClose={vi.fn()} title="Card" maxWidth="md" footer={<button type="button">Save</button>}><p>Body</p></Modal>)
    const body = screen.getByText('Body').parentElement
    expect(body.className).toBe('min-h-0 flex-1 overflow-y-auto px-6 pb-6')
    expect(body.parentElement.className).toBe('flex max-h-[88vh] flex-col overflow-hidden rounded-2xl bg-surface shadow-xl')
    expect(body.parentElement.parentElement.className).toBe('relative w-full max-w-md my-auto outline-none')
    expect(body.parentElement.getAttribute('style')).toBeNull()
    expect(screen.queryByRole('tablist')).toBeNull()
  })

  it('shows tabs under the title, with the open tab\'s content', () => {
    render(
      <Modal open onClose={vi.fn()} title="Listing" tabs={[
        { id: 'details', label: 'Details', content: <p>Details pane</p> },
        { id: 'media', label: 'Media', badge: 3, content: <p>Media pane</p> },
      ]} />
    )
    expect(screen.getByRole('tablist', { name: 'Listing' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Details pane')
    fireEvent.click(screen.getByRole('tab', { name: /Media/ }))
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Media pane')
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', screen.getByRole('tab', { name: /Media/ }).id)
  })

  it('moves between tabs with the arrow keys, skipping a disabled one', () => {
    const onTabChange = vi.fn()
    render(
      <Modal open onClose={vi.fn()} title="T" onTabChange={onTabChange}
        tabs={[{ id: 'a', label: 'A' }, { id: 'b', label: 'B', disabled: true }, { id: 'c', label: 'C' }]}>
        {(id) => <p>Pane {id}</p>}
      </Modal>
    )
    fireEvent.keyDown(screen.getByRole('tab', { name: 'A' }), { key: 'ArrowRight' })
    expect(onTabChange).toHaveBeenCalledWith('c')
    expect(screen.getByRole('tab', { name: 'C' })).toHaveFocus()
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Pane c')
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('tabindex', '-1')
  })

  it('lets the caller control the open tab, and falls back when it disappears', () => {
    const { rerender } = render(
      <Modal open onClose={vi.fn()} title="T" tabs={['Details', 'Trip']} activeTab="trip">{(id) => <p>Pane {id}</p>}</Modal>
    )
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Pane trip')
    rerender(<Modal open onClose={vi.fn()} title="T" tabs={['Details']} activeTab="trip">{(id) => <p>Pane {id}</p>}</Modal>)
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Pane details')
  })

  it('opens on defaultTab', () => {
    render(<Modal open onClose={vi.fn()} title="T" tabs={['One', 'Two']} defaultTab="two">{(id) => <p>Pane {id}</p>}</Modal>)
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Pane two')
  })

  it('gives the footer the open tab, so its actions follow the tab', () => {
    render(
      <Modal open onClose={vi.fn()} title="T" tabs={['Overview', 'Enquire']}
        footer={(id) => (id === 'enquire' ? <button type="submit" form="enquiry">Send</button> : null)}>
        {(id) => <p>Pane {id}</p>}
      </Modal>
    )
    expect(screen.queryByRole('button', { name: 'Send' })).toBeNull()
    fireEvent.click(screen.getByRole('tab', { name: 'Enquire' }))
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('keeps one height with fixedHeight', () => {
    render(<Modal open onClose={vi.fn()} title="T" fixedHeight><p>Body</p></Modal>)
    expect(screen.getByText('Body').parentElement.parentElement.className).toBe(
      'flex flex-col overflow-hidden bg-surface shadow-xl max-h-[88vh] rounded-2xl h-[min(40rem,88dvh)]'
    )
  })

  it('is a sheet at the bottom on phones, closed by a swipe down', () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="Sheet" sheet><p>Body</p></Modal>)
    const overlay = screen.getByRole('dialog', { name: 'Sheet' })
    expect(overlay.className).toContain('items-end sm:items-center')
    const card = screen.getByText('Body').parentElement.parentElement
    expect(card.className).toContain('max-h-[92dvh] rounded-t-2xl sm:max-h-[88vh] sm:rounded-2xl')
    const header = screen.getByRole('heading', { name: 'Sheet' }).closest('.touch-none')
    fireEvent.pointerDown(header, { clientY: 100, button: 0 })
    fireEvent.pointerMove(header, { clientY: 160 })
    expect(card.style.transform).toBe('translateY(60px)')
    fireEvent.pointerUp(header, { clientY: 300 })
    expect(onClose).toHaveBeenCalled()
  })

  it('springs back from a short slow drag, and cannot be swiped when not closeable', () => {
    const onClose = vi.fn()
    const now = vi.spyOn(Date, 'now')
    now.mockReturnValue(0)
    const { unmount } = render(<Modal open onClose={onClose} title="S" sheet><p>Body</p></Modal>)
    const header = screen.getByRole('heading', { name: 'S' }).closest('.touch-none')
    fireEvent.pointerDown(header, { clientY: 100, button: 0 })
    now.mockReturnValue(1000)
    fireEvent.pointerUp(header, { clientY: 140 })
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('Body').parentElement.parentElement.getAttribute('style')).toBeNull()
    unmount()
    now.mockRestore()
    render(<Modal open onClose={onClose} title="Locked" sheet closeable={false}><p>Body</p></Modal>)
    expect(screen.getByRole('heading', { name: 'Locked' }).closest('.touch-none')).toBeNull()
  })
})
