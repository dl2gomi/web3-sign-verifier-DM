import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationCircle,
  faCheckCircle,
  faTimesCircle,
  faEraser,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';
import { useMessageSigning } from '@/hooks/useMessageSigning';
import './Signer.css';

interface MessageFormProps {
  onSuccess?: () => void;
}

export function MessageForm({ onSuccess }: MessageFormProps) {
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    signer: string;
  } | null>(null);

  const { signAndVerify, isLoading, error, clearError } = useMessageSigning();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    // Clear previous results
    setShowSuccess(false);
    setVerificationResult(null);
    clearError();

    // Sign and verify
    const result = await signAndVerify(message);

    if (result) {
      setVerificationResult({
        isValid: result.isValid,
        signer: result.signer,
      });
      setShowSuccess(true);
      setMessage(''); // Clear input

      // Trigger refresh IMMEDIATELY - localStorage is already updated by signAndVerify
      onSuccess?.();

      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }
  };

  const handleClear = () => {
    setMessage('');
    setShowSuccess(false);
    setVerificationResult(null);
    clearError();
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="message-form-container">
      <div className="message-form-card">
        <div className="form-header">
          <h2>Sign Message</h2>
          <p>Enter any message to sign with your wallet</p>
        </div>

        <form onSubmit={handleSubmit} className="message-form">
          <div className="form-group">
            <label htmlFor="message">Your Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              rows={4}
              disabled={isLoading}
              className="textarea"
              maxLength={500}
            />
            <div className="character-count">{message.length} / 500 characters</div>
          </div>

          {error && (
            <div className="error-message">
              <FontAwesomeIcon icon={faExclamationCircle} className="message-icon" />
              <span>{error}</span>
            </div>
          )}

          {showSuccess && verificationResult && (
            <div className={`success-message ${verificationResult.isValid ? 'valid' : 'invalid'}`}>
              <div className="success-header">
                <FontAwesomeIcon
                  icon={verificationResult.isValid ? faCheckCircle : faTimesCircle}
                  className="message-icon"
                />
                <span className="success-title">
                  {verificationResult.isValid ? 'Signature Verified!' : 'Verification Failed'}
                </span>
              </div>
              <div className="success-details">
                <span className="success-label">Signer:</span>
                <code className="success-address" title={verificationResult.signer}>
                  {truncateAddress(verificationResult.signer)}
                </code>
              </div>
            </div>
          )}

          <div className="button-group">
            <button type="button" onClick={handleClear} className="btn btn-secondary" disabled={isLoading || !message}>
              <FontAwesomeIcon icon={faEraser} />
              <span>Clear</span>
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading || !message.trim()}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPenToSquare} />
                  <span>Sign & Verify</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
