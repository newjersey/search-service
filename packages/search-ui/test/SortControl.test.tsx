import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SortControl } from '../src/components/SortControl.js'

const options = [
  { value: 'deadline-asc', label: 'Deadline: soonest first', field: 'deadline', direction: 'asc' as const },
  { value: 'deadline-desc', label: 'Deadline: latest first', field: 'deadline', direction: 'desc' as const },
]

describe('SortControl', () => {
  it('renders a labeled select with one option per sort choice', () => {
    render(<SortControl label="Sort by" options={options} value={undefined} onChange={vi.fn()} />)
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Deadline: soonest first' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Deadline: latest first' })).toBeInTheDocument()
  })

  it('selects the option matching the current value', () => {
    render(
      <SortControl
        label="Sort by"
        options={options}
        value={{ field: 'deadline', direction: 'desc' }}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveValue('deadline-desc')
  })

  it('falls back to the first option when the current value matches none', () => {
    render(
      <SortControl
        label="Sort by"
        options={options}
        value={{ field: 'nonsense', direction: 'asc' }}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveValue('deadline-asc')
  })

  it("calls onChange with the selected option's field and direction", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SortControl label="Sort by" options={options} value={undefined} onChange={onChange} />)
    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'Deadline: latest first')
    expect(onChange).toHaveBeenCalledWith({ field: 'deadline', direction: 'desc' })
  })
})
