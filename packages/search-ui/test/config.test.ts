import { describe, it, expect } from 'vitest'
import { defineFacetUI } from '../src/config.js'

describe('defineFacetUI', () => {
  it('returns the config unchanged', () => {
    const config = defineFacetUI({ status: { label: 'Status', control: 'checkboxGroup' } })
    expect(config.status).toEqual({ label: 'Status', control: 'checkboxGroup' })
  })
})