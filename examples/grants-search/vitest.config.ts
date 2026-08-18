import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 60s, not 30s: a CI runner has no cached postgres:16 image, so the first
    // container start pulls it fresh over the network on top of normal
    // startup time. 30s was tuned against a machine with the image already
    // cached locally.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
})