import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useSearch } from '../src/useSearch.js'
import { defineFacetUI } from '../src/config.js'
import type { SearchResult } from '@newjersey/search-core'

const config = defineFacetUI({
  status: { label: 'Status', control: 'checkboxGroup' },
})

interface Grant {
  title: string
}

function makeResult(rows: Grant[]): SearchResult<Grant> {
  return { rows, total: rows.length, facetCounts: { status: [{ value: 'open', count: rows.length }] } }
}

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

describe('useSearch', () => {
  it('starts in loading status and transitions to success with results', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResult([{ title: 'Education Grant' }]))
    const { result } = renderHook(() => useSearch(config, { fetcher }))

    expect(result.current.status).toBe('loading')

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.results?.rows).toEqual([{ title: 'Education Grant' }])
  })

  it('transitions to error status when the fetcher rejects', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useSearch(config, { fetcher }))

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error?.message).toBe('network down')
  })

  it('does not conflate an empty result set with an error', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResult([]))
    const { result } = renderHook(() => useSearch(config, { fetcher }))

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.results?.rows).toEqual([])
    expect(result.current.error).toBeUndefined()
  })

  it('resets to page 1 and re-fetches when setFilter is called', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResult([{ title: 'Education Grant' }]))
    const { result } = renderHook(() => useSearch(config, { fetcher }))
    await waitFor(() => expect(result.current.status).toBe('success'))

    act(() => {
      result.current.setPage(2)
    })
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })))

    act(() => {
      result.current.setFilter('status', ['open'])
    })
    await waitFor(() =>
      expect(fetcher).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, filters: { status: ['open'] } }),
      ),
    )
  })

  it('reflects filter state into the URL', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResult([]))
    const { result } = renderHook(() => useSearch(config, { fetcher }))
    await waitFor(() => expect(result.current.status).toBe('success'))

    act(() => {
      result.current.setFilter('status', ['open'])
    })
    await waitFor(() => expect(window.location.search).toContain('status=open'))
  })

  it('builds a fetcher from the endpoint option and POSTs the request as JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeResult([]),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useSearch(config, { endpoint: '/api/grants/search' }))
    await waitFor(() => expect(result.current.status).toBe('success'))

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/grants/search',
      expect.objectContaining({ method: 'POST' }),
    )
    vi.unstubAllGlobals()
  })

  it('uses a custom urlAdapter instead of window.history when one is provided', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResult([]))
    const setSearchParams = vi.fn()
    const urlAdapter = {
      getSearchParams: () => new URLSearchParams(),
      setSearchParams,
    }
    const { result } = renderHook(() => useSearch(config, { fetcher, urlAdapter }))
    await waitFor(() => expect(result.current.status).toBe('success'))

    act(() => {
      result.current.setFilter('status', ['open'])
    })

    await waitFor(() => expect(setSearchParams).toHaveBeenCalled())
    const lastCall = setSearchParams.mock.calls[setSearchParams.mock.calls.length - 1][0] as URLSearchParams
    expect(lastCall.get('status')).toBe('open')
    // window.history was never touched because the custom adapter intercepted it.
    expect(window.location.search).toBe('')
  })
})