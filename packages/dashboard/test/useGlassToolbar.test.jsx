import { renderHook } from '@testing-library/react'
import { useGlassToolbar as useMobileToolbar } from '../dist/index.js'

const phone = (matches) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })
}
const scrollTo = (el, top) => {
  el.scrollTop = top
  el.dispatchEvent(new Event('scroll'))
}

describe('useMobileToolbar', () => {
  let main
  beforeEach(() => {
    main = document.createElement('main')
    document.body.appendChild(main)
    localStorage.clear()
  })
  afterEach(() => main.remove())

  it('tucks the toolbar away while scrolling down on a phone and brings it back on scroll up', () => {
    phone(true)
    const { unmount } = renderHook(() => useMobileToolbar())
    const html = document.documentElement

    scrollTo(main, 0)
    scrollTo(main, 300)
    expect(html.classList.contains('toolbar-tucked')).toBe(true)
    scrollTo(main, 200)
    expect(html.classList.contains('toolbar-tucked')).toBe(false)
    scrollTo(main, 400)
    scrollTo(main, 40) // back near the top
    expect(html.classList.contains('toolbar-tucked')).toBe(false)

    unmount()
    expect(html.classList.contains('toolbar-tucked')).toBe(false)
  })

  it('never tucks on larger screens, and remembers a device that needed the solid bar', () => {
    phone(false)
    localStorage.setItem('okjt-toolbar-solid', '1')
    renderHook(() => useMobileToolbar())
    scrollTo(main, 0)
    scrollTo(main, 500)
    expect(document.documentElement.classList.contains('toolbar-tucked')).toBe(false)
    expect(document.documentElement.classList.contains('toolbar-solid')).toBe(true)
  })

  it('reads the remembered solid bar under the project\'s own key', () => {
    phone(true)
    localStorage.clear()
    localStorage.setItem('naoa-toolbar-solid', '1')
    const { unmount } = renderHook(() => useMobileToolbar({ storageKey: 'naoa-toolbar-solid' }))
    expect(document.documentElement.classList.contains('toolbar-solid')).toBe(true)
    unmount()
    expect(document.documentElement.classList.contains('toolbar-solid')).toBe(false)
  })
})

