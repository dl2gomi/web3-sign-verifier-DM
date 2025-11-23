import { useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import './Auth.css';

interface EmbeddedLoginProps {
  onSuccess?: () => void;
}

export function EmbeddedLogin({ onSuccess }: EmbeddedLoginProps) {
  const { setShowAuthFlow } = useDynamicContext();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initiate email authentication
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Use Dynamic's setShowAuthFlow with email
      setShowAuthFlow(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Web3 Message Signer</h1>
          <p>Sign in with your email to get started</p>
        </div>

        <form onSubmit={handleEmailSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
              className="input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary btn-large" disabled={isLoading || !email}>
            {isLoading ? 'Connecting...' : 'Continue with Email'}
          </button>

          <p className="auth-note">We'll create or connect your embedded wallet securely</p>
        </form>
      </div>
    </div>
  );
}
