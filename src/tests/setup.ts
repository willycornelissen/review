import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock global fetch if needed in unit tests
if (!globalThis.fetch) {
  globalThis.fetch = vi.fn()
}
