import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { AdminInput, AdminSelect, AdminTextarea } from '../dist/index.js'

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
})
