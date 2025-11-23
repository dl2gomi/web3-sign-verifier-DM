import { useState } from 'react';
import { useIsLoggedIn, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-regular-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { Toaster } from 'react-hot-toast';
import { useDarkMode } from './lib/useDarkMode';
import { EmbeddedLogin, WalletDropdown } from './components/Auth';
import { MessageForm, SignatureHistory } from './components/Signer';
import './App.css';

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const isLoggedIn = useIsLoggedIn();
  const { sdkHasLoaded } = useDynamicContext();

  // Used to trigger history refresh when a new message is signed
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const handleMessageSigned = () => {
    // Immediately trigger refresh - the MessageForm already has delay
    setHistoryRefresh((prev) => prev + 1);
  };

  // Show loading state while SDK initializes
  if (!sdkHasLoaded) {
    return (
      <div className={`container ${isDarkMode ? 'dark' : 'light'}`} data-theme={isDarkMode ? 'dark' : 'light'}>
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading Web3 Signer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${isDarkMode ? 'dark' : 'light'}`} data-theme={isDarkMode ? 'dark' : 'light'}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDarkMode ? 'var(--bg-elevated)' : 'var(--bg-elevated)',
            color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)',
            border: `1px solid ${isDarkMode ? 'var(--border-light)' : 'var(--border-light)'}`,
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            padding: 'var(--space-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'var(--bg-elevated)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'var(--bg-elevated)',
            },
          },
        }}
      />
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">◆</span>
            <span className="logo-text">Web3 Signer</span>
          </div>
        </div>

        <div className="header-right">
          <button
            className="icon-button"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
          </button>

          {isLoggedIn && <WalletDropdown />}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {!isLoggedIn ? (
          // Show login form when not authenticated
          <EmbeddedLogin onSuccess={() => console.log('Login successful')} />
        ) : (
          // Show app when authenticated
          <>
            {/* Message Signing Form */}
            <MessageForm onSuccess={handleMessageSigned} />

            {/* Signature History */}
            <SignatureHistory refreshTrigger={historyRefresh} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">Created by Edward Serrano</p>
          <div className="footer-links">
            <a href="mailto:eds951122@hotmail.com" className="footer-link">
              <FontAwesomeIcon icon={faEnvelope} className="footer-icon" />
              <span>Email</span>
            </a>
            <a href="https://github.com/dl2gomi" target="_blank" rel="noopener noreferrer" className="footer-link">
              <FontAwesomeIcon icon={faGithub} className="footer-icon" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
