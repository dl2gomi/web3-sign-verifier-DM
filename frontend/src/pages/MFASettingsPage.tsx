import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldAlt,
  faToggleOn,
  faToggleOff,
  faKey,
  faCheckCircle,
  faSpinner,
  faArrowLeft,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';
import { useMFA } from '@/hooks';
import toast from 'react-hot-toast';
import '../components/Auth/MFA.css';
import './MFASettingsPage.css';

export function MFASettingsPage() {
  const navigate = useNavigate();
  const { user } = useDynamicContext();
  const { qrCodeUri, secretKey, isMFAEnabled, initiateMFASetup, verifyMFASetup, disableMFA } = useMFA();

  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleEnableMFA = async () => {
    setShowSetup(true);
    await initiateMFASetup();
  };

  const handleDisableMFA = async () => {
    if (
      confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')
    ) {
      const success = await disableMFA();
      if (success) {
        setShowSetup(false);
      }
    }
  };

  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(numericValue);
    setError(null);
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const success = await verifyMFASetup(verificationCode);
      if (success) {
        setShowSetup(false);
        setVerificationCode('');
      } else {
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

  const handleBack = () => {
    navigate('/app');
  };

  const handleCancelSetup = () => {
    setShowSetup(false);
    setVerificationCode('');
    setError(null);
  };

  return (
    <div className="mfa-settings-container">
      <div className="mfa-settings-card">
        {/* Back Button */}
        <button onClick={handleBack} className="mfa-back-btn">
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to App</span>
        </button>

        {!showSetup ? (
          <>
            {/* Header */}
            <div className="mfa-settings-header">
              <div className="mfa-shield-icon">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h1 className="mfa-title">Two-Factor Authentication</h1>
              <p className="mfa-subtitle">Manage your account security settings</p>
              {user?.email && <p className="mfa-email">{user.email}</p>}
            </div>

            {/* Status Section */}
            <div className="mfa-status-section">
              <div className="mfa-status-card">
                <div className="mfa-status-header">
                  <h3>Current Status</h3>
                  <div className={`mfa-status-badge ${isMFAEnabled ? 'enabled' : 'disabled'}`}>
                    <FontAwesomeIcon icon={isMFAEnabled ? faToggleOn : faToggleOff} />
                    <span>{isMFAEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
                <p className="mfa-status-description">
                  {isMFAEnabled
                    ? 'Your account is protected with two-factor authentication. You will need to enter a code from your authenticator app when signing in.'
                    : 'Two-factor authentication is currently disabled. Enable it to add an extra layer of security to your account.'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mfa-actions">
              {isMFAEnabled ? (
                <button onClick={handleDisableMFA} className="mfa-btn mfa-btn-danger">
                  <FontAwesomeIcon icon={faToggleOff} />
                  Disable MFA
                </button>
              ) : (
                <button onClick={handleEnableMFA} className="mfa-btn mfa-btn-primary">
                  <FontAwesomeIcon icon={faToggleOn} />
                  Enable MFA
                </button>
              )}
            </div>

            {/* Info Section */}
            <div className="mfa-info-section">
              <h3>How it works</h3>
              <ol className="mfa-info-list">
                <li>Download an authenticator app like Google Authenticator or Authy</li>
                <li>Scan the QR code with your authenticator app</li>
                <li>Enter the 6-digit code to verify setup</li>
                <li>You'll need this code every time you sign in</li>
              </ol>
            </div>
          </>
        ) : (
          <>
            {/* Setup Flow */}
            <div className="mfa-settings-header">
              <div className="mfa-shield-icon">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h1 className="mfa-title">Enable Two-Factor Authentication</h1>
              <p className="mfa-subtitle">Follow the steps below to secure your account</p>
            </div>

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
                        onClick={() => {
                          navigator.clipboard.writeText(secretKey);
                          toast.success('Secret key copied!');
                        }}
                        className="secret-key-copy-btn"
                        title="Copy secret key"
                      >
                        <FontAwesomeIcon icon={faCopy} />
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

                <form onSubmit={handleVerifySetup} className="mfa-verify-form">
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

                  <button
                    type="button"
                    onClick={handleCancelSetup}
                    className="mfa-btn mfa-btn-secondary"
                    disabled={isVerifying}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
