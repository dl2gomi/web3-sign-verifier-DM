import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import * as apiService from '@/services/api';
import * as storageService from '@/services/storage';

// Mock the services
vi.mock('@/services/api');
vi.mock('@/services/storage');

// Mock Dynamic SDK
const mockSignMessage = vi.fn();
const mockPrimaryWallet = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
  signMessage: mockSignMessage,
};

let mockWalletValue = mockPrimaryWallet;

vi.mock('@dynamic-labs/sdk-react-core', () => ({
  useDynamicContext: () => ({
    primaryWallet: mockWalletValue,
  }),
}));

vi.mock('@dynamic-labs/ethereum', () => ({
  isEthereumWallet: () => mockWalletValue !== null && mockWalletValue?.address !== undefined,
}));

describe('useMessageSigning Hook', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockWalletValue = {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      signMessage: mockSignMessage,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signMessage', () => {
    it('should sign a message successfully', async () => {
      // Import here to get fresh mock
      const { useMessageSigning } = await import('./useMessageSigning');
      
      const mockSignature = '0xabcdef123456';
      mockSignMessage.mockResolvedValue(mockSignature);
      vi.mocked(storageService.saveSignedMessage).mockImplementation(() => {});

      const { result } = renderHook(() => useMessageSigning());

      let signedMessage!: ReturnType<typeof result.current.signMessage> extends Promise<infer T> ? T : never;
      await act(async () => {
        signedMessage = await result.current.signMessage('Hello World');
      });

      expect(signedMessage).not.toBeNull();
      if (signedMessage) {
        expect(signedMessage.message).toBe('Hello World');
        expect(signedMessage.signature).toBe(mockSignature);
        expect(signedMessage.walletAddress).toBe(mockWalletValue.address);
      }
      expect(mockSignMessage).toHaveBeenCalledWith('Hello World');
      expect(storageService.saveSignedMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Hello World',
          signature: mockSignature,
        })
      );
    });

    it('should return null when wallet is not connected', async () => {
      const { useMessageSigning } = await import('./useMessageSigning');
      
      // Set wallet to null
      mockWalletValue = null as any;

      const { result } = renderHook(() => useMessageSigning());

      let signedMessage;
      await act(async () => {
        signedMessage = await result.current.signMessage('Test');
      });

      expect(signedMessage).toBeNull();
      expect(result.current.error).toBe('No wallet connected');
    });

    it('should handle signing errors', async () => {
      const { useMessageSigning } = await import('./useMessageSigning');
      
      mockSignMessage.mockRejectedValue(new Error('User rejected'));
      vi.mocked(storageService.saveSignedMessage).mockImplementation(() => {});

      const { result } = renderHook(() => useMessageSigning());

      let signedMessage;
      await act(async () => {
        signedMessage = await result.current.signMessage('Test');
      });

      expect(signedMessage).toBeNull();
      expect(result.current.error).toBe('User rejected');
    });

    it('should not sign when wallet address is undefined', async () => {
      const { useMessageSigning } = await import('./useMessageSigning');
      
      mockWalletValue = {
        address: undefined as any,
        signMessage: mockSignMessage,
      };

      const { result } = renderHook(() => useMessageSigning());

      let signedMessage;
      await act(async () => {
        signedMessage = await result.current.signMessage('Test');
      });

      expect(signedMessage).toBeNull();
      expect(result.current.error).toBe('Wallet address not available');
    });
  });

  describe('verifyMessage', () => {
    it('should verify a message successfully', async () => {
      const { useMessageSigning } = await import('./useMessageSigning');
      
      const mockVerificationResponse = {
        isValid: true,
        signer: '0x1234567890abcdef1234567890abcdef12345678',
        originalMessage: 'Hello World',
      };

      vi.mocked(apiService.verifySignature).mockResolvedValue(mockVerificationResponse);
      vi.mocked(storageService.updateSignedMessage).mockImplementation(() => {});

      const { result } = renderHook(() => useMessageSigning());

      let verificationResult;
      await act(async () => {
        verificationResult = await result.current.verifyMessage(
          'msg-123',
          'Hello World',
          '0xsignature'
        );
      });

      expect(verificationResult).toEqual(mockVerificationResponse);
      expect(apiService.verifySignature).toHaveBeenCalledWith('Hello World', '0xsignature');
      expect(storageService.updateSignedMessage).toHaveBeenCalledWith('msg-123', {
        verified: true,
        verificationResult: mockVerificationResponse,
      });
    });

    it('should handle verification errors', async () => {
      const { useMessageSigning } = await import('./useMessageSigning');
      
      vi.mocked(apiService.verifySignature).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useMessageSigning());

      let verificationResult;
      await act(async () => {
        verificationResult = await result.current.verifyMessage(
          'msg-123',
          'Test',
          '0xsig'
        );
      });

      expect(verificationResult).toBeNull();
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('signAndVerify', () => {
    it('should sign and verify a message in sequence', async () => {
      const { useMessageSigning } = await import('./useMessageSigning');
      
      const mockSignature = '0xabcdef123456';
      const mockVerificationResponse = {
        isValid: true,
        signer: '0x1234567890abcdef1234567890abcdef12345678',
        originalMessage: 'Hello World',
      };

      mockSignMessage.mockResolvedValue(mockSignature);
      vi.mocked(storageService.saveSignedMessage).mockImplementation(() => {});
      vi.mocked(apiService.verifySignature).mockResolvedValue(mockVerificationResponse);
      vi.mocked(storageService.updateSignedMessage).mockImplementation(() => {});

      const { result } = renderHook(() => useMessageSigning());

      let verificationResult;
      await act(async () => {
        verificationResult = await result.current.signAndVerify('Hello World');
      });

      expect(verificationResult).toEqual(mockVerificationResponse);
      expect(mockSignMessage).toHaveBeenCalledWith('Hello World');
      expect(apiService.verifySignature).toHaveBeenCalled();
    });

    it('should return null if signing fails', async () => {
      const { useMessageSigning } = await import('./useMessageSigning');
      
      mockSignMessage.mockRejectedValue(new Error('Signing failed'));

      const { result } = renderHook(() => useMessageSigning());

      let verificationResult;
      await act(async () => {
        verificationResult = await result.current.signAndVerify('Test');
      });

      expect(verificationResult).toBeNull();
      expect(apiService.verifySignature).not.toHaveBeenCalled();
    });
  });

  describe('loading states', () => {
    it('should set isSigningLoading during signing', async () => {
      const { useMessageSigning } = await import('./useMessageSigning');
      
      mockSignMessage.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('0xsig'), 100))
      );
      vi.mocked(storageService.saveSignedMessage).mockImplementation(() => {});

      const { result } = renderHook(() => useMessageSigning());

      expect(result.current.isSigningLoading).toBe(false);

      act(() => {
        result.current.signMessage('Test');
      });

      await waitFor(() => {
        expect(result.current.isSigningLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isSigningLoading).toBe(false);
      }, { timeout: 500 });
    });

    it('should set isVerifyingLoading during verification', async () => {
      const { useMessageSigning } = await import('./useMessageSigning');
      
      vi.mocked(apiService.verifySignature).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  isValid: true,
                  signer: '0x123',
                  originalMessage: 'Test',
                }),
              100
            )
          )
      );
      vi.mocked(storageService.updateSignedMessage).mockImplementation(() => {});

      const { result } = renderHook(() => useMessageSigning());

      expect(result.current.isVerifyingLoading).toBe(false);

      act(() => {
        result.current.verifyMessage('msg-1', 'Test', '0xsig');
      });

      await waitFor(() => {
        expect(result.current.isVerifyingLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isVerifyingLoading).toBe(false);
      }, { timeout: 500 });
    });
  });

  describe('error handling', () => {
    it('should clear error when clearError is called', async () => {
      const { useMessageSigning } = await import('./useMessageSigning');
      
      mockSignMessage.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useMessageSigning());

      await act(async () => {
        await result.current.signMessage('Test');
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});

