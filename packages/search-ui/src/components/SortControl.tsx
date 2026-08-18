import type { ChangeEvent } from 'react'
import type { SortDirection, SortSpec } from '@newjersey/search-core'

export interface SortOption {
  value: string
  label: string
  field: string
  direction: SortDirection
}

export interface SortControlProps {
  label: string
  options: SortOption[]
  value: SortSpec | undefined
  onChange: (sort: SortSpec) => void
}

export function SortControl({ label, options, value, onChange }: SortControlProps) {
  const selected =
    options.find((option) => option.field === value?.field && option.direction === value?.direction) ?? options[0]

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const option = options.find((o) => o.value === event.target.value)
    if (option) {
      onChange({ field: option.field, direction: option.direction })
    }
  }

  return (
    <label>
      {label}
      <select value={selected?.value} onChange={handleChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
