import { useNavigate } from 'react-router-dom';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { MFASetup, MFAVerification } from '@/components/Auth';
import { useMFA } from '@/hooks';
import { useEffect } from 'react';

export function MFAPage() {
  const navigate = useNavigate();
  const { user } = useDynamicContext();
  const { mfaState, qrCodeUri, secretKey, initiateMFASetup, verifyMFASetup, verifyMFALogin, setMFAState } = useMFA();

  // Initialize MFA setup when page loads if needed
  useEffect(() => {
    if (mfaState === 'setup' && !qrCodeUri) {
      initiateMFASetup();
    }
  }, [mfaState, qrCodeUri, initiateMFASetup]);

  const handleMFASetupComplete = async (code: string) => {
    const success = await verifyMFASetup(code);
    if (success) {
      navigate('/app');
    }
    return success;
  };

  const handleMFAVerificationComplete = async (code: string) => {
    const success = await verifyMFALogin(code);
    if (success) {
      setMFAState('enabled');
      navigate('/app');
    }
    return success;
  };

  const handleSkipMFASetup = () => {
    navigate('/app');
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <>
      {mfaState === 'verification' ? (
        <MFAVerification
          email={user?.email}
          onVerifyCode={handleMFAVerificationComplete}
          onBack={handleBackToLogin}
        />
      ) : (
        <MFASetup
          qrCodeUri={qrCodeUri}
          secretKey={secretKey}
          onVerifyCode={handleMFASetupComplete}
          onSkip={handleSkipMFASetup}
        />
      )}
    </>
  );
}

