import type { SearchRequest } from "@newjersey/search-core";
import { InvalidSearchRequestError, runSearch } from "@newjersey/search-query";
import { db } from "../../../../src/db";
import { grantsSearchConfig } from "../../../../src/searchConfig";

interface Grant {
  id: number;
  title: string;
  description: string;
  status: string;
  category: string;
  funding_amount: number;
  application_deadline: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as SearchRequest;

  try {
    const result = await runSearch<Grant>(db, grantsSearchConfig, body);
    return Response.json(result);
  } catch (error) {
    if (error instanceof InvalidSearchRequestError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    // biome-ignore lint/suspicious/noConsole: no logging library in this example app; server-side error visibility
    console.error("Grants search failed", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
