# @newjersey/search-core

NJIA builds faceted search (checkboxes/filters + sort) for a lot of projects, usually from scratch each time. `search-core` is the shared vocabulary — filter values, sort specs, search requests, and results — that the `search-query` (backend) and `search-ui` (frontend) packages both build on, so they can't quietly drift out of sync with each other.

It has no runtime code, only TypeScript types. It exists purely so the two halves of a search integration agree on shapes at compile time instead of failing at runtime.
