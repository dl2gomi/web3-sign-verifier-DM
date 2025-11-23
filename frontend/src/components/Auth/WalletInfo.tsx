import { useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import './Auth.css';

export function WalletInfo() {
  const { primaryWallet, user, handleLogOut } = useDynamicContext();
  const [copied, setCopied] = useState(false);

  const walletAddress = primaryWallet?.address;

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-info">
      <div className="wallet-header">
        <div className="wallet-badge">
          <div className="wallet-icon">●</div>
          <div className="wallet-details">
            <span className="wallet-label">Connected Wallet</span>
            <div className="wallet-address-container">
              <span className="wallet-address" title={walletAddress}>
                {walletAddress ? truncateAddress(walletAddress) : 'Loading...'}
              </span>
              <button onClick={handleCopyAddress} className="btn-icon" title="Copy address">
                {copied ? '✓' : '□'}
              </button>
            </div>
          </div>
        </div>

        {user?.email && (
          <div className="user-email">
            <span className="email-icon">@</span>
            <span>{user.email}</span>
          </div>
        )}

        <button onClick={handleLogOut} className="btn btn-secondary btn-small">
          Logout
        </button>
      </div>
    </div>
  );
}
