// apps/server/test/jest-environment-jsdom-fix.ts

import { TestEnvironment } from 'jest-environment-jsdom';
import type {
  EnvironmentContext,
  JestEnvironmentConfig,
} from '@jest/environment';
import { TextEncoder, TextDecoder } from 'util';

/**
 * Custom Jest Environment that extends JSDOM with necessary polyfills
 * This solves TextEncoder/TextDecoder issues with modern JSDOM versions
 */
class JSDOMEnvironmentWithPolyfills extends TestEnvironment {
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(config, context);

    // Add TextEncoder/TextDecoder to the global scope
    if (typeof this.global.TextEncoder === 'undefined') {
      this.global.TextEncoder = TextEncoder;
    }

    if (typeof this.global.TextDecoder === 'undefined') {
      // Cast to any to handle minor type differences
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.global.TextDecoder = TextDecoder as any;
    }

    // Add structuredClone polyfill
    if (typeof this.global.structuredClone === 'undefined') {
      this.global.structuredClone = (obj: unknown) => {
        // More robust implementation using MessageChannel if available
        if (typeof MessageChannel !== 'undefined') {
          return new Promise((resolve) => {
            const { port1, port2 } = new MessageChannel();
            port1.onmessage = (ev) => resolve(ev.data);
            port2.postMessage(obj);
          });
        }
        // Fallback to JSON serialization
        return JSON.parse(JSON.stringify(obj)) as unknown;
      };
    }

    // Fix common JSDOM issues
    this.fixJSDOMIssues();
  }

  private fixJSDOMIssues() {
    // Fix matchMedia
    Object.defineProperty(this.global.window, 'matchMedia', {
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

    // Fix scrollTo
    this.global.window.scrollTo = jest.fn();

    // Add missing IntersectionObserver
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      disconnect() {}
      observe() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    } as any;

    // Add missing ResizeObserver
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.global.ResizeObserver = class ResizeObserver {
      constructor() {}
      disconnect() {}
      observe() {}
      unobserve() {}
    } as any;

    // Fix getComputedStyle
    const originalGetComputedStyle = this.global.window.getComputedStyle;
    this.global.window.getComputedStyle = (element: Element) => {
      try {
        return originalGetComputedStyle(element);
      } catch {
        return originalGetComputedStyle(this.global.document.body);
      }
    };

    // Add performance.now() if missing
    if (!this.global.performance) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.global.performance = {
        now: () => Date.now(),
      } as any;
    }

    // Add crypto.randomUUID if missing
    if (!this.global.crypto) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.global.crypto = {
        randomUUID: () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            (c) => {
              const r = (Math.random() * 16) | 0;
              const v = c === 'x' ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            },
          );
        },
        getRandomValues: (array: Uint8Array) => {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
          return array;
        },
      } as any;
    }
  }

  async setup() {
    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }
}

module.exports = JSDOMEnvironmentWithPolyfills;
