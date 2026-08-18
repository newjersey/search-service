'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { SearchUrlAdapter } from '@newjersey/search-ui'

export function useNextUrlAdapter(): SearchUrlAdapter {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return {
    getSearchParams: () => new URLSearchParams(searchParams.toString()),
    setSearchParams: (params) => {
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
  }
}