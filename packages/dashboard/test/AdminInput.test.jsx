import { render, screen, fireEvent } from '@testing-library/react'
import { AdminInput, AdminSelect } from '../dist/index.js'

describe('AdminInput', () => {
  it('renders input with label', () => {
    render(<AdminInput label="Name" />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('displays value', () => {
    render(<AdminInput label="Name" value="John" readOnly />)
    expect(screen.getByRole('textbox')).toHaveValue('John')
  })

  it('calls onChange', () => {
    const onChange = vi.fn()
    render(<AdminInput label="Name" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Jane' } })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('passes its ref to the control, so forms can focus it', () => {
    const ref = { current: null }
    render(<AdminInput label="Name" ref={ref} />)
    expect(ref.current).toBe(screen.getByRole('textbox'))
    ref.current.focus()
    expect(screen.getByRole('textbox')).toHaveFocus()
  })

  it('takes its background from --okjt-input-bg (white by default), so dark dashboards can set one', () => {
    render(<AdminSelect label="Kind" defaultValue="a"><option value="a">A</option></AdminSelect>)
    expect(screen.getByRole('combobox').className).toContain('bg-[var(--okjt-input-bg,#fff)]')
  })
})

