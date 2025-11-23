import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faKey, faSpinner, faCheckCircle, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import './MFA.css';

interface MFASetupProps {
  qrCodeUri?: string;
  secretKey?: string;
  onVerifyCode: (code: string) => Promise<boolean>;
  onSkip?: () => void;
}

export function MFASetup({ qrCodeUri, secretKey, onVerifyCode, onSkip }: MFASetupProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopySecret = async () => {
    if (secretKey) {
      await navigator.clipboard.writeText(secretKey);
      setCopied(true);
      toast.success('Secret key copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mfa-container">
      <div className="mfa-card">
        {/* Shield Icon */}
        <div className="mfa-shield-icon">
          <FontAwesomeIcon icon={faShieldAlt} />
        </div>

        {/* Title */}
        <h1 className="mfa-title">Enable Two-Factor Authentication</h1>
        <p className="mfa-subtitle">Add an extra layer of security to your account</p>

        <div className="mfa-steps">
          {/* Step 1: Scan QR Code */}
          <div className="mfa-step">
            <div className="step-header">
              <span className="step-number">1</span>
              <h3 className="step-title">Scan QR Code</h3>
            </div>
            <p className="step-description">Use an authenticator app like Google Authenticator or Authy</p>

            <div className="qr-code-wrapper">
              {qrCodeUri ? (
                <img src={qrCodeUri} alt="MFA QR Code" className="qr-code-image" />
              ) : (
                <div className="qr-code-loading">
                  <FontAwesomeIcon icon={faSpinner} spin size="3x" />
                  <p>Generating QR code...</p>
                </div>
              )}
            </div>

            {qrCodeUri && secretKey && (
              <div className="secret-key-section">
                <p className="secret-key-label">Or enter this key manually:</p>
                <div className="secret-key-container">
                  <code className="secret-key-text">{secretKey}</code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="secret-key-copy-btn"
                    title={copied ? 'Copied!' : 'Copy secret key'}
                  >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Enter Code */}
          <div className="mfa-step">
            <div className="step-header">
              <span className="step-number">2</span>
              <h3 className="step-title">Enter Verification Code</h3>
            </div>
            <p className="step-description">Enter the 6-digit code from your authenticator app</p>

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

              <button
                type="submit"
                className="mfa-btn mfa-btn-primary"
                disabled={verificationCode.length !== 6 || isVerifying}
              >
                {isVerifying ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Verifying...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Enable MFA
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {onSkip && (
          <button onClick={onSkip} className="mfa-skip-btn" disabled={isVerifying}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
