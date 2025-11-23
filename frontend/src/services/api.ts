import type { VerificationRequest, VerificationResponse, ApiError } from '@/types';

// Get backend URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

/**
 * Verify a signature with the backend
 * @param message - The message to verify
 * @param signature - The signature to verify
 * @returns The verification response
 */
export async function verifySignature(message: string, signature: string): Promise<VerificationResponse> {
  try {
    const response = await fetch(`${API_URL}/verify-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        signature,
      } as VerificationRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || 'Failed to verify signature',
        statusCode: response.status,
        details: errorData.details,
      } as ApiError;
    }

    const data: VerificationResponse = await response.json();
    return data;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    // Network or other errors
    throw {
      message: error instanceof Error ? error.message : 'Network error',
      statusCode: 0,
      details: 'Failed to connect to backend',
    } as ApiError;
  }
}

/**
 * Health check endpoint (optional, for testing backend connectivity)
 * @returns True if the backend is healthy, false otherwise
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
