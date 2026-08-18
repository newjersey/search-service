import type { ChangeEvent } from 'react'

export interface CheckboxGroupFilterOption {
  value: string
  label: string
  count?: number
}

export interface CheckboxGroupFilterProps {
  facetKey: string
  legend: string
  options: CheckboxGroupFilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function CheckboxGroupFilter({
  facetKey,
  legend,
  options,
  selected,
  onChange,
}: CheckboxGroupFilterProps) {
  function handleChange(value: string, event: ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      onChange([...selected, value])
    } else {
      onChange(selected.filter((v) => v !== value))
    }
  }

  return (
    <fieldset>
      <legend>{legend}</legend>
      {options.map((option) => {
        const id = `${facetKey}-${option.value}`
        return (
          <div key={option.value}>
            <input
              type="checkbox"
              id={id}
              checked={selected.includes(option.value)}
              onChange={(event) => handleChange(option.value, event)}
            />
            <label htmlFor={id}>
              {option.label}
              {option.count !== undefined ? ` (${option.count})` : ''}
            </label>
          </div>
        )
      })}
    </fieldset>
  )
}