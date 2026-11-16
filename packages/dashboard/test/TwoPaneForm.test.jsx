import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { TwoPaneForm, FieldError, AdminInput } from '../dist/index.js'

const sections = [
  {
    id: 'who', label: 'Who', fields: ['name'],
    render: ({ field, error }) => (<><AdminInput label="Name" {...field('name')} /><FieldError message={error('name')} /></>),
    summary: (v) => [['Name', v.name]],
  },
  { id: 'notes', label: 'Notes', fields: ['notes'], render: ({ field }) => <AdminInput label="Notes" {...field('notes')} />, summary: (v) => [['Notes', v.notes]] },
]
const form = (props = {}) => (
  <TwoPaneForm open title="Add" sections={sections} initial={{ name: '', notes: '' }} onClose={vi.fn()} onSubmit={vi.fn(() => Promise.resolve())}
    validate={(v) => ({ name: v.name ? null : 'Add a name' })} {...props} />
)

describe('TwoPaneForm', () => {
  beforeEach(() => localStorage.clear())

  it('checks a field when it loses focus and lists what is missing before saving', async () => {
    const onSubmit = vi.fn(() => Promise.resolve())
    render(form({ onSubmit }))
    expect(screen.queryByText('Add a name')).not.toBeInTheDocument()
    fireEvent.blur(screen.getByLabelText('Name'))
    expect(screen.getByText('Add a name')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('heading', { name: 'Who' })).toBeInTheDocument() // the Check details summary
    expect(screen.getByRole('button', { name: 'Add a name' })).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Add a name' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Akinyi' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Akinyi', notes: '' }))
  })

  it('keeps a draft of a new entry until it is saved', async () => {
    const { unmount } = render(form({ draftKey: 'test-new' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Joy' } })
    unmount()

    const onSubmit = vi.fn(() => Promise.resolve())
    render(form({ draftKey: 'test-new', onSubmit }))
    expect(screen.getByLabelText('Name')).toHaveValue('Joy')
    expect(screen.getByText('We kept what you’d typed last time.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(localStorage.getItem('draft:test-new')).toBeNull()
  })
})
