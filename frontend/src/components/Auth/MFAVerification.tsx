import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faKey, faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './MFA.css';

interface MFAVerificationProps {
  email?: string;
  onVerifyCode: (code: string) => Promise<boolean>;
  onBack?: () => void;
}

export function MFAVerification({ email, onVerifyCode, onBack }: MFAVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const success = await onVerifyCode(verificationCode);
      if (!success) {
        setError('Invalid verification code. Please try again.');
        setVerificationCode('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setVerificationCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(numericValue);
    setError(null);
  };

  return (
    <div className="mfa-container">
      <div className="mfa-card">
        {/* Shield Icon */}
        <div className="mfa-shield-icon">
          <FontAwesomeIcon icon={faShieldAlt} />
        </div>

        {/* Title */}
        <h1 className="mfa-title">Two-Factor Authentication</h1>
        <p className="mfa-subtitle">Enter the code from your authenticator app</p>
        {email && <p className="mfa-email">{email}</p>}

        <form onSubmit={handleVerify} className="mfa-verify-form">
          <div className="code-input-wrapper">
            <FontAwesomeIcon icon={faKey} className="code-input-icon" />
            <input
              type="text"
              inputMode="numeric"
              value={verificationCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="0 0 0 0 0 0"
              maxLength={6}
              className="mfa-code-input"
              disabled={isVerifying}
              autoFocus
            />
          </div>

          {error && <div className="mfa-error">{error}</div>}

          <button type="submit" className="mfa-btn mfa-btn-primary" disabled={verificationCode.length !== 6 || isVerifying}>
            {isVerifying ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Verifying...
              </>
            ) : (
              'Verify & Continue'
            )}
          </button>

          {onBack && (
            <button type="button" onClick={onBack} className="mfa-btn mfa-btn-secondary" disabled={isVerifying}>
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

