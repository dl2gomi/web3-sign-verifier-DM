import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faEnvelope, faChevronDown, faCopy, faCheck, faSignOutAlt, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import './Auth.css';

export function WalletDropdown() {
  const { primaryWallet, user, handleLogOut } = useDynamicContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const walletAddress = primaryWallet?.address;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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

  const handleMFASettingsClick = () => {
    setIsOpen(false);
    navigate('/mfa-settings');
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    handleLogOut();
    toast.success('Logged out successfully!');
  };

  return (
    <div className="wallet-dropdown" ref={dropdownRef}>
      <button
        className="wallet-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FontAwesomeIcon icon={faWallet} className="wallet-icon-small" />
        <span className="wallet-address-short">
          {walletAddress ? truncateAddress(walletAddress) : 'Loading...'}
        </span>
        <FontAwesomeIcon icon={faChevronDown} className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="wallet-dropdown-menu">
          <div className="dropdown-section">
            <div className="dropdown-label">Wallet Address</div>
            <div className="dropdown-address-container">
              <code className="dropdown-address" title={walletAddress}>
                {walletAddress || 'N/A'}
              </code>
              <button
                onClick={handleCopyAddress}
                className="dropdown-icon-btn"
                title={copied ? 'Copied!' : 'Copy address'}
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
              </button>
            </div>
          </div>

          {user?.email && (
            <div className="dropdown-section">
              <div className="dropdown-label">Email</div>
              <div className="dropdown-value">
                <FontAwesomeIcon icon={faEnvelope} className="dropdown-icon" />
                <span>{user.email}</span>
              </div>
            </div>
          )}

          <div className="dropdown-divider"></div>

          <button onClick={handleMFASettingsClick} className="dropdown-menu-btn">
            <FontAwesomeIcon icon={faShieldAlt} />
            <span>MFA Settings</span>
          </button>

          <button onClick={handleLogoutClick} className="dropdown-logout-btn">
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
