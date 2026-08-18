import { runSearch, InvalidSearchRequestError } from '@newjersey/search-query'
import type { SearchRequest } from '@newjersey/search-core'
import { db } from '../../../../src/db.js'
import { grantsSearchConfig } from '../../../../src/searchConfig.js'

interface Grant {
  id: number
  title: string
  description: string
  status: string
  category: string
  funding_amount: number
  application_deadline: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as SearchRequest

  try {
    const result = await runSearch<Grant>(db, grantsSearchConfig, body)
    return Response.json(result)
  } catch (error) {
    if (error instanceof InvalidSearchRequestError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    console.error('Grants search failed', error)
    return Response.json({ error: 'Search failed' }, { status: 500 })
  }
}