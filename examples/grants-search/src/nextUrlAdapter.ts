"use client";

import type { SearchUrlAdapter } from "@newjersey/search-ui";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useNextUrlAdapter(): SearchUrlAdapter {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return {
    getSearchParams: () => new URLSearchParams(searchParams.toString()),
    setSearchParams: (params) => {
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
  };
}
