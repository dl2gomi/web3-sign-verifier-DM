import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { verifySignature, healthCheck } from './api';
import type { VerificationResponse, ApiError } from '@/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('verifySignature', () => {
    it('should successfully verify a signature', async () => {
      const mockResponse: VerificationResponse = {
        isValid: true,
        signer: '0x1234567890abcdef',
        originalMessage: 'Hello World',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verifySignature('Hello World', '0xabc123');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/v1/verify-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello World',
          signature: '0xabc123',
        }),
      });
    });

    it('should throw ApiError when response is not ok', async () => {
      const mockErrorResponse = {
        message: 'Invalid signature',
        details: 'Signature verification failed',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      });

      await expect(verifySignature('Hello World', '0xbadsignature')).rejects.toMatchObject({
        message: 'Invalid signature',
        statusCode: 400,
        details: 'Signature verification failed',
      });
    });

    it('should handle JSON parse errors in error response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(verifySignature('Hello World', '0xabc123')).rejects.toMatchObject({
        message: 'Failed to verify signature',
        statusCode: 500,
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(verifySignature('Hello World', '0xabc123')).rejects.toMatchObject({
        message: 'Network error',
        statusCode: 0,
        details: 'Failed to connect to backend',
      });
    });

    it('should handle non-Error exceptions', async () => {
      (global.fetch as any).mockRejectedValueOnce('Something went wrong');

      await expect(verifySignature('Hello World', '0xabc123')).rejects.toMatchObject({
        message: 'Network error',
        statusCode: 0,
        details: 'Failed to connect to backend',
      });
    });

    it('should rethrow ApiError without modification', async () => {
      const apiError: ApiError = {
        message: 'Custom error',
        statusCode: 401,
        details: 'Unauthorized',
      };

      (global.fetch as any).mockRejectedValueOnce(apiError);

      await expect(verifySignature('Hello World', '0xabc123')).rejects.toEqual(apiError);
    });
  });

  describe('healthCheck', () => {
    it('should return true when backend is healthy', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      const result = await healthCheck();

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/v1/health');
    });

    it('should return false when backend returns error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      const result = await healthCheck();

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await healthCheck();

      expect(result).toBe(false);
    });
  });
});
