import { useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import toast from 'react-hot-toast';
import { verifySignature } from '@/services/api';
import { saveSignedMessage, updateSignedMessage } from '@/services/storage';
import type { SignedMessage, VerificationResponse } from '@/types';

export function useMessageSigning() {
  const { primaryWallet } = useDynamicContext();
  const [isSigningLoading, setIsSigningLoading] = useState(false);
  const [isVerifyingLoading, setIsVerifyingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sign a message with the connected wallet
   */
  const signMessage = async (message: string): Promise<SignedMessage | null> => {
    if (!primaryWallet) {
      const errorMsg = 'No wallet connected';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    if (!primaryWallet.address) {
      const errorMsg = 'Wallet address not available';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    // Store address as a const to ensure type safety
    const walletAddress = primaryWallet.address;

    if (!isEthereumWallet(primaryWallet)) {
      const errorMsg = 'Only Ethereum wallets are supported for signing';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    setIsSigningLoading(true);
    setError(null);

    try {
      // Sign the message
      const signature = await primaryWallet.signMessage(message);
      if (!signature) {
        const errorMsg = 'Failed to sign message';
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }

      // Create the signed message object
      const signedMessage: SignedMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        message,
        signature,
        timestamp: Date.now(),
        walletAddress, // Now guaranteed to be string
      };

      // Save to localStorage
      saveSignedMessage(signedMessage);
      toast.success('Message signed successfully!');

      return signedMessage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign message';
      setError(errorMessage);
      toast.error(`Signing failed: ${errorMessage}`);
      return null;
    } finally {
      setIsSigningLoading(false);
    }
  };

  /**
   * Verify a signed message with the backend
   */
  const verifyMessage = async (
    messageId: string,
    message: string,
    signature: string,
  ): Promise<VerificationResponse | null> => {
    setIsVerifyingLoading(true);
    setError(null);

    try {
      // Call backend API
      const result = await verifySignature(message, signature);

      // Update the message in storage with verification result
      updateSignedMessage(messageId, {
        verified: result.isValid,
        verificationResult: result,
      });

      if (result.isValid) {
        toast.success('Signature verified successfully!');
      } else {
        toast.error('Signature verification failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify signature';
      setError(errorMessage);

      // Check if it's a network/backend error
      if (err instanceof TypeError || errorMessage.includes('fetch') || errorMessage.includes('network')) {
        toast.error('Cannot communicate with the backend. Please ensure the backend server is running.');
      } else {
        toast.error(`Verification failed: ${errorMessage}`);
      }

      return null;
    } finally {
      setIsVerifyingLoading(false);
    }
  };

  /**
   * Sign and immediately verify a message
   */
  const signAndVerify = async (message: string): Promise<VerificationResponse | null> => {
    // Step 1: Sign the message
    const signedMessage = await signMessage(message);
    if (!signedMessage) return null;

    // Step 2: Verify with backend
    const verificationResult = await verifyMessage(signedMessage.id, signedMessage.message, signedMessage.signature);

    return verificationResult;
  };

  return {
    signMessage,
    verifyMessage,
    signAndVerify,
    isSigningLoading,
    isVerifyingLoading,
    isLoading: isSigningLoading || isVerifyingLoading,
    error,
    clearError: () => setError(null),
  };
}
