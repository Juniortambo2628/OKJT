import { render, screen, fireEvent, act } from '@testing-library/react'
import { Toaster, toast } from 'react-hot-toast'
import { undoable, useUndoableRemoval } from '../dist/index.js'

// F7: undo instead of "are you sure?", from TFE. Nothing is sent until the
// window closes, so Undo never has to reverse anything.
beforeAll(() => {
  // react-hot-toast's Toaster asks for prefers-reduced-motion; jsdom has no matchMedia.
  window.matchMedia ||= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
})
beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { act(() => { toast.remove() }); vi.useRealTimers() })

const flushPromises = () => act(async () => { await Promise.resolve(); await Promise.resolve() })

describe('undoable', () => {
  it('sends nothing until the window closes, then commits once', async () => {
    render(<Toaster />)
    const commit = vi.fn()
    act(() => { undoable('Goal deleted', commit) })
    await flushPromises()
    expect(screen.getByText('Goal deleted')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(4999) })
    expect(commit).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(1) })
    await flushPromises()
    expect(commit).toHaveBeenCalledTimes(1)
  })

  it('Undo inside the window means it is never sent', async () => {
    render(<Toaster />)
    const commit = vi.fn()
    const onUndo = vi.fn()
    act(() => { undoable('RSVP removed', commit, { onUndo, undoLabel: 'Put it back' }) })
    await flushPromises()
    fireEvent.click(screen.getByRole('button', { name: 'Put it back' }))
    expect(onUndo).toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(10000) })
    await flushPromises()
    expect(commit).not.toHaveBeenCalled()
  })

  it('calls onError when the commit fails', async () => {
    render(<Toaster />)
    const onError = vi.fn()
    act(() => { undoable('Deleted', () => Promise.reject(new Error('nope')), { onError, delay: 100 }) })
    act(() => { vi.advanceTimersByTime(100) })
    await flushPromises()
    expect(onError).toHaveBeenCalled()
  })
})

function List({ commit }) {
  const { isHidden, remove } = useUndoableRemoval()
  return (
    <ul>
      {['a', 'b'].filter((id) => !isHidden(id)).map((id) => (
        <li key={id}>{id} <button type="button" onClick={() => remove(id, { message: `Removed ${id}`, commit: () => commit(id) })}>Remove {id}</button></li>
      ))}
    </ul>
  )
}

describe('useUndoableRemoval', () => {
  it('hides the row at once, commits after the window, and Undo brings it back unsent', async () => {
    const commit = vi.fn()
    render(<><Toaster /><List commit={commit} /></>)
    fireEvent.click(screen.getByRole('button', { name: 'Remove a' }))
    expect(screen.queryByText('Remove a')).toBeNull()
    await flushPromises()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getByRole('button', { name: 'Remove a' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Remove b' }))
    act(() => { vi.advanceTimersByTime(5000) })
    await flushPromises()
    expect(commit).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledWith('b')
  })

  it('brings the row back when the commit fails', async () => {
    render(<><Toaster /><List commit={() => Promise.reject(new Error('offline'))} /></>)
    fireEvent.click(screen.getByRole('button', { name: 'Remove a' }))
    act(() => { vi.advanceTimersByTime(5000) })
    await flushPromises()
    expect(screen.getByRole('button', { name: 'Remove a' })).toBeInTheDocument()
  })

  it('commits what is pending when the page is left', async () => {
    const commit = vi.fn()
    const { unmount } = render(<><Toaster /><List commit={commit} /></>)
    fireEvent.click(screen.getByRole('button', { name: 'Remove a' }))
    unmount()
    await flushPromises()
    expect(commit).toHaveBeenCalledWith('a')
  })
})
