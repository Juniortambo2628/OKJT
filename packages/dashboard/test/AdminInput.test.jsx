import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { AdminInput, AdminSelect, AdminTextarea, DashboardProvider } from '../dist/index.js'

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

  it('passes a ref to the control', () => {
    const input = createRef(), select = createRef(), area = createRef()
    render(<><AdminInput ref={input} label="A" /><AdminSelect ref={select} label="B"><option>x</option></AdminSelect><AdminTextarea ref={area} label="C" /></>)
    expect(input.current.tagName).toBe('INPUT')
    expect(select.current.tagName).toBe('SELECT')
    expect(area.current.tagName).toBe('TEXTAREA')
  })

  it('renders the control alone with bare, keeping the caller\'s describedby', () => {
    const { container } = render(<AdminInput bare aria-describedby="mine" error="Required" />)
    expect(container.firstChild.tagName).toBe('INPUT')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'mine')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText('Required')).toBeNull()
  })

  it('draws its background and text colour from the field variables', () => {
    render(<AdminInput label="Name" />)
    expect(screen.getByRole('textbox').className).toContain('bg-[var(--okjt-field-bg,transparent)]')
    expect(screen.getByRole('textbox').className).toContain('text-[color:var(--okjt-field-text,inherit)]')
  })

  it('links the error to the field', () => {
    render(<AdminTextarea label="Notes" error="Too long" />)
    const field = screen.getByRole('textbox')
    expect(field).toHaveAccessibleDescription('Too long')
  })

  it('keeps the kit\'s classes when nothing replaces them', () => {
    render(<AdminInput label="Name" className="mt-1" />)
    expect(screen.getByRole('textbox').className).toBe('w-full px-4 py-2 rounded-lg border border-tone-200 bg-[var(--okjt-field-bg,transparent)] text-[color:var(--okjt-field-text,inherit)] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors  mt-1')
  })

  it('takes the project\'s base classes per control from componentDefaults', () => {
    const classNames = { input: 'house-input', select: 'house-select', textarea: 'house-textarea' }
    render(
      <DashboardProvider dashboard={{ componentDefaults: { Field: { classNames } } }}>
        <AdminInput bare aria-label="A" className="mt-1" />
        <AdminSelect bare aria-label="B"><option>x</option></AdminSelect>
        <AdminTextarea bare aria-label="C" error="Too long" />
      </DashboardProvider>
    )
    expect(screen.getByRole('textbox', { name: 'A' }).className).toBe('house-input  mt-1')
    expect(screen.getByRole('combobox').className).toBe('house-select  ')
    expect(screen.getByRole('textbox', { name: 'C' }).className).toBe('house-textarea border-red-400 ')
  })

  it('lets one field replace its base classes with baseClassName', () => {
    render(
      <DashboardProvider dashboard={{ componentDefaults: { Field: { classNames: { input: 'house-input' } } } }}>
        <AdminInput bare aria-label="A" baseClassName="special" />
      </DashboardProvider>
    )
    expect(screen.getByRole('textbox').className).toBe('special  ')
  })
})
