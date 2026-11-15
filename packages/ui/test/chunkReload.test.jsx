import { installChunkReload, shouldReloadForChunks, isChunkLoadError } from '../dist/index.js'

const memory = () => {
  const data = {}
  return { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v } }
}

describe('chunk reload', () => {
  beforeEach(() => window.sessionStorage.clear())

  it('reloads once, then not again within the window', () => {
    const storage = memory()
    expect(shouldReloadForChunks({ now: 1_000_000, storage })).toBe(true)
    expect(shouldReloadForChunks({ now: 1_030_000, storage })).toBe(false)
    expect(shouldReloadForChunks({ now: 1_070_000, storage })).toBe(true)
  })

  it('recognises failed lazy imports from each browser', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://x/assets/Settings-1.js'))).toBe(true)
    expect(isChunkLoadError('Importing a module script failed.')).toBe(true)
    expect(isChunkLoadError(new Error('error loading dynamically imported module'))).toBe(true)
    expect(isChunkLoadError(new Error('Unable to preload CSS for /assets/x.css'))).toBe(true)
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false)
  })

  it('reloads on vite:preloadError and a chunk rejection, once in the window', () => {
    const reload = vi.fn()
    const stop = installChunkReload({ reload })
    const event = new Event('vite:preloadError', { cancelable: true })
    window.dispatchEvent(event)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)

    const rejection = new Event('unhandledrejection')
    rejection.reason = new TypeError('Failed to fetch dynamically imported module: /a.js')
    window.dispatchEvent(rejection)
    expect(reload).toHaveBeenCalledTimes(1) // inside the window
    stop()
  })

  it('ignores other errors, and installing twice listens once', () => {
    const reload = vi.fn()
    const stop = installChunkReload({ reload })
    expect(installChunkReload({ reload: vi.fn() })).toBe(stop)
    const rejection = new Event('unhandledrejection')
    rejection.reason = new Error('Network down')
    window.dispatchEvent(rejection)
    expect(reload).not.toHaveBeenCalled()
    stop()
    window.dispatchEvent(new Event('vite:preloadError', { cancelable: true }))
    expect(reload).not.toHaveBeenCalled()
  })
})
