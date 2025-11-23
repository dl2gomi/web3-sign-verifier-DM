import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import toast from 'react-hot-toast';

export type MFAState = 'disabled' | 'setup' | 'verification' | 'enabled';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
const MFA_API_URL = `${API_BASE_URL}/api/${API_VERSION}/mfa`;

export function useMFA() {
  const { user, primaryWallet } = useDynamicContext();
  const [mfaState, setMFAState] = useState<MFAState>('disabled');
  const [qrCodeUri, setQrCodeUri] = useState<string | undefined>();
  const [secretKey, setSecretKey] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Helper to get user identifier
  const getUserIdentifier = () => {
    return user?.email || primaryWallet?.address || 'unknown';
  };

  // Check if user has MFA enabled
  useEffect(() => {
    const checkMFAStatus = async () => {
      if (user || primaryWallet) {
        try {
          const userIdentifier = getUserIdentifier();
          const response = await fetch(`${MFA_API_URL}/status?userIdentifier=${encodeURIComponent(userIdentifier)}`);
          
          if (response.ok) {
            const data = await response.json();
            setMFAState(data.enabled ? 'enabled' : 'disabled');
          }
        } catch (error) {
          console.error('Failed to check MFA status:', error);
        }
      }
    };

    checkMFAStatus();
  }, [user, primaryWallet]);

  /**
   * Initialize MFA setup
   */
  const initiateMFASetup = async (): Promise<string | null> => {
    setIsLoading(true);
    setQrCodeUri(undefined);
    setSecretKey(undefined);
    
    try {
      const userIdentifier = getUserIdentifier();
      
      const response = await fetch(`${MFA_API_URL}/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdentifier }),
      });

      if (!response.ok) {
        throw new Error('Failed to setup MFA');
      }

      const data = await response.json();
      
      setQrCodeUri(data.qrCodeUri);
      setSecretKey(data.secret);
      setMFAState('setup');
      
      return data.qrCodeUri;
    } catch (error) {
      console.error('Failed to initiate MFA setup:', error);
      toast.error('Failed to setup MFA. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify MFA code during setup
   */
  const verifyMFASetup = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userIdentifier = getUserIdentifier();
      
      const response = await fetch(`${MFA_API_URL}/verify-setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdentifier, token: code }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setMFAState('enabled');
        toast.success('MFA enabled successfully!');
        return true;
      }
      
      toast.error('Invalid verification code');
      return false;
    } catch (error) {
      console.error('Failed to verify MFA setup:', error);
      toast.error('Failed to verify MFA code');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify MFA code during login
   */
  const verifyMFALogin = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userIdentifier = getUserIdentifier();
      
      const response = await fetch(`${MFA_API_URL}/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdentifier, token: code }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('MFA verification successful!');
        return true;
      }
      
      toast.error('Invalid verification code');
      return false;
    } catch (error) {
      console.error('Failed to verify MFA login:', error);
      toast.error('Failed to verify MFA code');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Disable MFA
   */
  const disableMFA = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userIdentifier = getUserIdentifier();
      
      const response = await fetch(`${MFA_API_URL}/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdentifier }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setMFAState('disabled');
        setQrCodeUri(undefined);
        setSecretKey(undefined);
        toast.success('MFA disabled successfully');
        return true;
      }
      
      throw new Error('Failed to disable MFA');
    } catch (error) {
      console.error('Failed to disable MFA:', error);
      toast.error('Failed to disable MFA');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mfaState,
    qrCodeUri,
    secretKey,
    isLoading,
    isMFAEnabled: mfaState === 'enabled',
    initiateMFASetup,
    verifyMFASetup,
    verifyMFALogin,
    disableMFA,
    setMFAState,
  };
}

