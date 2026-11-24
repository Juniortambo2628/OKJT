import { renderHook } from '@testing-library/react'
import { useFilteredItems } from '../dist/index.js'

describe('useFilteredItems', () => {
  const items = [
    { name: 'Alice', email: 'alice@test.com' },
    { name: 'Bob', email: 'bob@test.com' },
    { name: 'Charlie', email: 'charlie@test.com' },
  ]

  it('filters items by search query', () => {
    const { result } = renderHook(() => useFilteredItems(items, 'alice'))
    expect(result.current).toHaveLength(1)
    expect(result.current[0].name).toBe('Alice')
  })

  it('returns all items when search is empty', () => {
    const { result } = renderHook(() => useFilteredItems(items, ''))
    expect(result.current).toHaveLength(3)
  })

  describe('with options', () => {
    const expenses = [
      { id: 1, title: 'Cement', recipient: 'Bamburi', project_id: 7, amount: 300 },
      { id: 2, title: 'Sand', recipient: 'Athi River', project_id: 8, amount: 100 },
      { id: 3, title: 'Steel', recipient: 'Mabati cement works', project_id: 7, amount: 200 },
    ]

    it('searches only the fields asked for', () => {
      const { result } = renderHook(() => useFilteredItems(expenses, { searchQuery: 'cement', searchFields: ['title'] }))
      expect(result.current.map((e) => e.id)).toEqual([1])
      const { result: both } = renderHook(() => useFilteredItems(expenses, { searchQuery: 'cement', searchFields: ['title', 'recipient'] }))
      expect(both.current.map((e) => e.id)).toEqual([1, 3])
    })

    it('keeps items matching where, compared as text, ignoring empty values', () => {
      const { result } = renderHook(() => useFilteredItems(expenses, { where: { project_id: '7' } }))
      expect(result.current.map((e) => e.id)).toEqual([1, 3])
      const { result: none } = renderHook(() => useFilteredItems(expenses, { where: { project_id: null } }))
      expect(none.current).toHaveLength(3)
    })

    it('sorts without changing the list it was given', () => {
      const byAmount = (a, b) => a.amount - b.amount
      const { result } = renderHook(() => useFilteredItems(expenses, { sortFn: byAmount }))
      expect(result.current.map((e) => e.id)).toEqual([2, 3, 1])
      expect(expenses.map((e) => e.id)).toEqual([1, 2, 3])
    })

    it('combines where, search and sort', () => {
      const { result } = renderHook(() => useFilteredItems(expenses, { where: { project_id: 7 }, searchQuery: 'e', searchFields: ['title'], sortFn: (a, b) => a.amount - b.amount }))
      expect(result.current.map((e) => e.id)).toEqual([3, 1])
    })

    it('keeps the same result while fresh but equal options are passed', () => {
      const { result, rerender } = renderHook(() => useFilteredItems(expenses, { searchQuery: 'a', searchFields: ['title'], where: { project_id: 7 } }))
      const first = result.current
      rerender()
      expect(result.current).toBe(first)
    })
  })
})

