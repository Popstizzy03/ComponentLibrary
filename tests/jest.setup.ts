// apps/server/test/jest.setup.ts

/**
 * Jest Setup Configuration
 * Provides necessary polyfills and global configurations for testing environment
 */

// Polyfill TextEncoder/TextDecoder for Node.js environments < 11
// This is required for JSDOM and whatwg-url compatibility
import { TextEncoder, TextDecoder } from 'util';

// Type-safe global assignments with proper typing
declare global {
  const TextEncoder: typeof import('util').TextEncoder;
  const TextDecoder: typeof import('util').TextDecoder;
}

// Only polyfill if not already available (Node.js < 11 or certain test environments)
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  // Use a proper type cast instead of 'any'
  global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}

// Additional polyfills for comprehensive JSDOM support
if (typeof global.structuredClone === 'undefined') {
  // Simple structured clone polyfill for testing
  // This is now type-safe due to the explicit 'unknown' types.
  global.structuredClone = (obj: unknown): unknown => {
    return JSON.parse(JSON.stringify(obj)) as unknown;
  };
}

// Set up fetch polyfill if needed (for future API testing)
if (typeof global.fetch === 'undefined') {
  // You can add node-fetch here if needed for API testing
  // import fetch from 'node-fetch';
  // (global as any).fetch = fetch;
}

// Configure JSDOM environment defaults
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Remove the unnecessary eslint-disable directive
global.IntersectionObserver = class IntersectionObserver
  implements IntersectionObserver
{
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof global.IntersectionObserver;

// Set test environment URL (important for JSDOM)
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost',
    origin: 'http://localhost',
  },
  writable: true,
});

// Suppress specific console warnings during tests if needed
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Filter out expected warnings/errors that clutter test output
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Not implemented: navigation')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Not implemented')) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Export for potential use in individual test files
export { TextEncoder, TextDecoder };
