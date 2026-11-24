import { act, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom'
import {
  useUnsavedChangesGuard,
  useHasUnsavedChanges,
  hasUnsavedChanges,
  confirmLeave,
  useGuardedNavigate,
  allowNextNavigation,
  UnsavedChangesStatus,
  AdminChromeProvider,
} from '../dist/index.js'

const feedback = vi.hoisted(() => ({ confirm: vi.fn() }))
vi.mock('@okjt/ui', async (importOriginal) => ({
  ...(await importOriginal()),
  confirmAction: (...args) => feedback.confirm(...args),
}))

function Form({ dirty }) {
  useUnsavedChangesGuard(dirty, 'Your expense has not been saved.')
  const go = useGuardedNavigate()
  const any = useHasUnsavedChanges()
  return (
    <>
      <p>{any ? 'unsaved' : 'clean'}</p>
      <Link to="/other">Other</Link>
      <button type="button" onClick={() => go('/other')}>Go</button>
    </>
  )
}

function App({ dirty }) {
  return (
    <MemoryRouter initialEntries={['/form']}>
      <Routes>
        <Route path="/form" element={<Form dirty={dirty} />} />
        <Route path="/other" element={<p>Other page</p>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  feedback.confirm.mockResolvedValue(false)
})

describe('useUnsavedChangesGuard', () => {
  it('reports unsaved forms page-wide and stops reporting on unmount', () => {
    const { rerender, unmount } = render(<App dirty />)
    expect(screen.getByText('unsaved')).toBeInTheDocument()
    expect(hasUnsavedChanges()).toBe(true)
    rerender(<App dirty={false} />)
    expect(screen.getByText('clean')).toBeInTheDocument()
    rerender(<App dirty />)
    unmount()
    expect(hasUnsavedChanges()).toBe(false)
  })

  it('asks before a link, with the form\'s message, and stays on Cancel', async () => {
    render(<App dirty />)
    fireEvent.click(screen.getByText('Other'))
    await waitFor(() => expect(feedback.confirm).toHaveBeenCalledWith(expect.objectContaining({ message: 'Your expense has not been saved.' })))
    expect(screen.queryByText('Other page')).toBeNull()
  })

  it('asks before a navigate() call through useGuardedNavigate, and goes on Leave', async () => {
    feedback.confirm.mockResolvedValue(true)
    render(<App dirty />)
    fireEvent.click(screen.getByText('Go'))
    expect(await screen.findByText('Other page')).toBeInTheDocument()
    expect(feedback.confirm).toHaveBeenCalledTimes(1)
  })

  it('lets the visit right after a save through without asking', async () => {
    render(<App dirty />)
    act(() => allowNextNavigation())
    fireEvent.click(screen.getByText('Go'))
    expect(await screen.findByText('Other page')).toBeInTheDocument()
    expect(feedback.confirm).not.toHaveBeenCalled()
  })

  it('confirmLeave answers true at once when nothing is unsaved', async () => {
    await expect(confirmLeave()).resolves.toBe(true)
    expect(feedback.confirm).not.toHaveBeenCalled()
  })

  it('asks once when two navigations happen together', async () => {
    let answer
    feedback.confirm.mockReturnValue(new Promise((resolve) => { answer = resolve }))
    render(<App dirty />)
    const a = confirmLeave()
    const b = confirmLeave()
    answer(true)
    await expect(Promise.all([a, b])).resolves.toEqual([true, true])
    expect(feedback.confirm).toHaveBeenCalledTimes(1)
  })
})

describe('UnsavedChangesStatus', () => {
  it('follows the page-wide store when not told', () => {
    const slot = document.createElement('div')
    document.body.appendChild(slot)
    function Page({ dirty }) {
      useUnsavedChangesGuard(dirty)
      return <AdminChromeProvider value={{ titleSlot: null, statusSlot: slot }}><UnsavedChangesStatus /></AdminChromeProvider>
    }
    const { rerender } = render(<MemoryRouter><Page dirty={false} /></MemoryRouter>)
    expect(slot).toBeEmptyDOMElement()
    rerender(<MemoryRouter><Page dirty /></MemoryRouter>)
    expect(slot).toHaveTextContent('Unsaved changes')
    slot.remove()
  })

  it('still obeys an explicit dirty', () => {
    const slot = document.createElement('div')
    document.body.appendChild(slot)
    render(<MemoryRouter><AdminChromeProvider value={{ titleSlot: null, statusSlot: slot }}><UnsavedChangesStatus dirty /></AdminChromeProvider></MemoryRouter>)
    expect(slot).toHaveTextContent('Unsaved changes')
    slot.remove()
  })
})
