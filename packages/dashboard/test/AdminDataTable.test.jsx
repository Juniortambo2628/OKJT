import { render, screen, fireEvent, within, act } from '@testing-library/react'
import AdminDataTable from '../dist/AdminDataTable.js'

const guests = [
  { id: 1, name: 'Amina', email: 'amina@example.com', phone: '0700 000 001' },
  { id: 2, name: 'Brian', email: 'brian@example.com', phone: '0700 000 002' },
  { id: 3, name: 'Chebet', email: 'chebet@example.com', phone: '0700 000 003' },
]

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: () => <span>E-mail</span>, meta: { label: 'Email' } },
  { accessorKey: 'phone', header: 'Phone', meta: { detailOnly: true } },
]

const cards = () => document.querySelector('[data-view="cards"]')
const tableView = () => document.querySelector('[data-view="table"]')

describe('AdminDataTable (lifted from Tena-host DataTable, F6)', () => {
  it('draws a table and one card per row, with the first column heading each card', () => {
    render(<AdminDataTable data={guests} columns={columns} />)
    expect(within(tableView()).getAllByRole('row')).toHaveLength(4) // header + 3
    const items = within(cards()).getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0].firstChild).toHaveTextContent('Amina')
  })

  it('labels card rows with meta.label, else a text header', () => {
    render(<AdminDataTable data={guests.slice(0, 1)} columns={[...columns, { accessorKey: 'id', header: 'Guest no.' }]} />)
    const card = within(cards()).getByRole('listitem')
    expect(card).toHaveTextContent('Email')
    expect(card).toHaveTextContent('Guest no.')
  })

  it('keeps detailOnly columns out of the table and cards, and shows them in "View details"', async () => {
    render(<AdminDataTable data={guests} columns={columns} detailTitle="Guest" />)
    expect(screen.queryByText('0700 000 001')).toBeNull()
    fireEvent.click(within(tableView()).getAllByRole('button', { name: 'View details' })[0])
    const dialog = await screen.findByRole('dialog', { name: 'Guest' })
    expect(dialog).toHaveTextContent('Phone')
    expect(dialog).toHaveTextContent('0700 000 001')
    expect(dialog).toHaveTextContent('amina@example.com')
  })

  it('runs row actions from the row and from the details dialog (closing it)', async () => {
    const remove = vi.fn()
    const rowActions = [{ key: 'delete', label: 'Delete', icon: <span>x</span>, variant: 'danger', onClick: remove }]
    render(<AdminDataTable data={guests} columns={columns} rowActions={rowActions} detailTitle="Guest" />)
    fireEvent.click(within(cards()).getAllByRole('button', { name: 'Delete' })[1])
    expect(remove).toHaveBeenLastCalledWith(guests[1])

    fireEvent.click(within(tableView()).getAllByRole('button', { name: 'View details' })[2])
    const dialog = await screen.findByRole('dialog', { name: 'Guest' })
    fireEvent.click(within(dialog).getByRole('button', { name: /Delete/ }))
    expect(remove).toHaveBeenLastCalledWith(guests[2])
  })

  it('translates the title, card labels and action names', () => {
    const rowActions = [{ key: 'v', label: 'Guests', icon: <span>v</span>, onClick: () => {} }]
    render(<AdminDataTable data={guests.slice(0, 1)} columns={columns} title="Guests" rowActions={rowActions} translate={(s) => s.replace('Guest', 'Customer')} />)
    expect(screen.getByRole('heading', { name: 'Customers' })).toBeInTheDocument()
    expect(within(cards()).getByRole('button', { name: 'Customers' })).toBeInTheDocument()
  })

  it('searches and sorts on the client', () => {
    render(<AdminDataTable data={guests} columns={columns} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'brian' } })
    expect(within(cards()).getAllByRole('listitem')).toHaveLength(1)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } })

    const nameHeader = within(tableView()).getByRole('columnheader', { name: /Name/ })
    fireEvent.click(nameHeader)
    fireEvent.click(nameHeader)
    expect(nameHeader).toHaveAttribute('aria-sort', 'descending')
    expect(within(cards()).getAllByRole('listitem')[0]).toHaveTextContent('Chebet')
  })

  it('reports selected rows, or ids when the selection is controlled', () => {
    const onSelectionChange = vi.fn()
    const { rerender } = render(<AdminDataTable data={guests} columns={columns} enableSelection onSelectionChange={onSelectionChange} />)
    fireEvent.click(within(tableView()).getAllByRole('checkbox', { name: 'Select row' })[0])
    expect(onSelectionChange).toHaveBeenLastCalledWith([guests[0]])

    rerender(<AdminDataTable data={guests} columns={columns} enableSelection selectedIds={[2]} onSelectionChange={onSelectionChange} />)
    expect(within(tableView()).getAllByRole('checkbox', { name: 'Select row' })[1]).toBeChecked()
    fireEvent.click(within(tableView()).getAllByRole('checkbox', { name: 'Select row' })[2])
    expect(onSelectionChange).toHaveBeenLastCalledWith([2, 3])
  })

  it('pages on the server through onPageChange', () => {
    const onPageChange = vi.fn()
    const page = { current_page: 2, last_page: 4, from: 11, to: 20, total: 40, prev_page_url: '?page=1', next_page_url: '?page=3' }
    render(<AdminDataTable data={guests} columns={columns} serverPagination={page} onPageChange={onPageChange} />)
    expect(screen.getByText('Showing 11-20 of 40')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(3)
    fireEvent.click(screen.getByRole('button', { name: 'First page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(1)
  })

  it('tells the page what was typed, after a pause, including clearing it (client paging)', () => {
    vi.useFakeTimers()
    try {
      const onSearch = vi.fn()
      render(<AdminDataTable data={guests} columns={columns} onSearch={onSearch} />)
      act(() => { vi.advanceTimersByTime(400) })
      expect(onSearch).not.toHaveBeenCalled()
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'che' } })
      act(() => { vi.advanceTimersByTime(300) })
      expect(onSearch).toHaveBeenLastCalledWith('che')
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } })
      act(() => { vi.advanceTimersByTime(300) })
      expect(onSearch).toHaveBeenLastCalledWith('')
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows the empty state when nothing matches', () => {
    render(<AdminDataTable data={[]} columns={columns} emptyMessage="No guests yet" />)
    expect(screen.getByText('No guests yet')).toBeInTheDocument()
    expect(cards()).toBeNull()
  })
})
