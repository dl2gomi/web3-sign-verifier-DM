import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './MFAAlert.css';

interface MFAAlertProps {
  onDismiss: () => void;
}

export function MFAAlert({ onDismiss }: MFAAlertProps) {
  const navigate = useNavigate();

  const handleEnableMFA = () => {
    navigate('/mfa-settings');
  };

  return (
    <div className="mfa-alert">
      <div className="mfa-alert-content">
        <div className="mfa-alert-icon">
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>
        <div className="mfa-alert-text">
          <h4>Two-Factor Authentication is disabled</h4>
          <p>Your account is not protected with MFA. Enable it now to add an extra layer of security.</p>
        </div>
        <div className="mfa-alert-actions">
          <button onClick={handleEnableMFA} className="mfa-alert-btn mfa-alert-btn-primary">
            <FontAwesomeIcon icon={faShieldAlt} />
            <span>Enable MFA</span>
          </button>
          <button onClick={onDismiss} className="mfa-alert-btn mfa-alert-btn-dismiss">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
    </div>
  );
}

