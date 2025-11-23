import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useIsLoggedIn, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-regular-svg-icons';
import { faEnvelope, faSignature } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { Toaster } from 'react-hot-toast';
import { useDarkMode } from './lib/useDarkMode';
import { EmbeddedLogin, WalletDropdown } from './components/Auth';
import { MainPage, MFAPage, MFASettingsPage } from './pages';
import { useMFA } from './hooks';
import './App.css';

// Login redirect component
function LoginRedirect() {
  const navigate = useNavigate();
  const isLoggedIn = useIsLoggedIn();
  const { mfaState } = useMFA();

  useEffect(() => {
    if (isLoggedIn) {
      // Redirect to MFA if setup needed or verification required
      if (mfaState === 'setup' || mfaState === 'verification') {
        navigate('/mfa');
      } else {
        navigate('/app');
      }
    }
  }, [isLoggedIn, mfaState, navigate]);

  return <EmbeddedLogin />;
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useIsLoggedIn();
  const { mfaState } = useMFA();

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // If user needs MFA setup or verification, redirect to MFA page
  if (mfaState === 'setup' || mfaState === 'verification') {
    return <Navigate to="/mfa" replace />;
  }

  return <>{children}</>;
}

// MFA route wrapper
function MFARoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useIsLoggedIn();
  const { mfaState } = useMFA();

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // If MFA already completed (enabled but not in verification state), redirect to app
  if (mfaState === 'enabled') {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const isLoggedIn = useIsLoggedIn();

  return (
    <div className={`container ${isDarkMode ? 'dark' : 'light'}`} data-theme={isDarkMode ? 'dark' : 'light'}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)',
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
            <span className="logo-icon">
              <FontAwesomeIcon icon={faSignature} />
            </span>
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

      {/* Main Content with Routing */}
      <main className="main-content">
        <Routes>
          {/* Login Page */}
          <Route path="/" element={<LoginRedirect />} />

          {/* MFA Page - Protected, requires login */}
          <Route
            path="/mfa"
            element={
              <MFARoute>
                <MFAPage />
              </MFARoute>
            }
          />

          {/* Main App - Protected, requires login and MFA */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />

          {/* MFA Settings - Protected, requires login */}
          <Route
            path="/mfa-settings"
            element={
              <ProtectedRoute>
                <MFASettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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

// Main App with Router
function App() {
  const { sdkHasLoaded } = useDynamicContext();
  const { isDarkMode } = useDarkMode();

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
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
