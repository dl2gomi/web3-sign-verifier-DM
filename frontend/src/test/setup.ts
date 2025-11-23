import { afterEach, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Suppress console errors/warnings in tests (they clutter output)
beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

// Restore console after all tests
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

// Mock environment variables
vi.stubEnv('VITE_BACKEND_API_URL', 'http://localhost:3000');
vi.stubEnv('VITE_API_VERSION', 'v1');
