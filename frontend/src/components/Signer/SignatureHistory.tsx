import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import toast from 'react-hot-toast';
import {
  faHistory,
  faCheckCircle,
  faTimesCircle,
  faHourglassHalf,
  faCopy,
  faCheck,
  faChevronRight,
  faTrashAlt,
  faSync,
  faBroom,
} from '@fortawesome/free-solid-svg-icons';
import { getSignatureHistory, deleteSignedMessage, clearHistory } from '@/services/storage';
import { verifySignature } from '@/services/api';
import type { SignedMessage } from '@/types';
import './Signer.css';

interface SignatureHistoryProps {
  refreshTrigger?: number;
}

export function SignatureHistory({ refreshTrigger }: SignatureHistoryProps) {
  const [history, setHistory] = useState<SignedMessage[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copyStates, setCopyStates] = useState<Record<string, string>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    // Load history immediately when refreshTrigger changes
    loadHistory();
  }, [refreshTrigger]);

  const loadHistory = () => {
    const messages = getSignatureHistory();
    setHistory(messages);
  };

  const handleCopy = async (text: string, id: string, field: string) => {
    await navigator.clipboard.writeText(text);
    const key = `${id}-${field}`;
    setCopyStates((prev) => ({ ...prev, [key]: 'copied' }));
    toast.success('Copied to clipboard!');
    setTimeout(() => {
      setCopyStates((prev) => ({ ...prev, [key]: '' }));
    }, 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this signature?')) {
      deleteSignedMessage(id);
      loadHistory();
      toast.success('Signature deleted successfully');
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all signature history?')) {
      clearHistory();
      loadHistory();
      toast.success('All signatures cleared');
    }
  };

  const handleReVerify = async (message: SignedMessage) => {
    setVerifyingId(message.id);
    try {
      const result = await verifySignature(message.message, message.signature);
      // Update the message with new verification result
      const updatedHistory = history.map((m) =>
        m.id === message.id
          ? {
              ...m,
              verificationResult: result,
            }
          : m,
      );
      setHistory(updatedHistory);

      if (result.isValid) {
        toast.success('Signature re-verified successfully!');
      } else {
        toast.error('Re-verification failed');
      }
    } catch (error) {
      console.error('Re-verification failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (error instanceof TypeError || errorMessage.includes('fetch') || errorMessage.includes('network')) {
        toast.error('Cannot communicate with the backend. Please ensure the backend server is running.');
      } else {
        toast.error(`Re-verification failed: ${errorMessage}`);
      }
    } finally {
      setVerifyingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const getCopyIcon = (id: string, field: string) => {
    const key = `${id}-${field}`;
    return copyStates[key] === 'copied' ? faCheck : faCopy;
  };

  if (history.length === 0) {
    return (
      <div className="history-container">
        <div className="history-card">
          <div className="history-header">
            <div className="history-title-section">
              <h2>Signature History</h2>
              <p className="history-count">0 messages</p>
            </div>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">
              <FontAwesomeIcon icon={faHistory} />
            </div>
            <p className="empty-state-text">No signatures yet. Sign your first message above!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-card">
        <div className="history-header">
          <div className="history-title-section">
            <h2>Signature History</h2>
            <p className="history-count">
              {history.length} {history.length === 1 ? 'message' : 'messages'}
            </p>
          </div>
          <div className="history-actions">
            <button onClick={handleClearAll} className="btn btn-secondary btn-small">
              <FontAwesomeIcon icon={faBroom} />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        <div className="history-list">
          {history.map((item) => {
            const isExpanded = expandedId === item.id;
            const isVerifying = verifyingId === item.id;

            return (
              <div key={item.id} className="history-item">
                <div className="history-item-header" onClick={() => toggleExpand(item.id)}>
                  <div className="history-item-left">
                    <div className="history-item-message">{item.message}</div>
                    <div className="history-item-meta">
                      <span className="history-item-time">{formatTimestamp(item.timestamp)}</span>
                      <span className="history-item-address">
                        <code>{truncateAddress(item.walletAddress)}</code>
                      </span>
                    </div>
                  </div>
                  <div className="history-item-right">
                    {item.verificationResult && (
                      <span className={`history-status ${item.verificationResult.isValid ? 'verified' : 'failed'}`}>
                        <FontAwesomeIcon icon={item.verificationResult.isValid ? faCheckCircle : faTimesCircle} />
                        <span>{item.verificationResult.isValid ? 'Verified' : 'Failed'}</span>
                      </span>
                    )}
                    {!item.verificationResult && (
                      <span className="history-status pending">
                        <FontAwesomeIcon icon={faHourglassHalf} />
                        <span>Pending</span>
                      </span>
                    )}
                    <FontAwesomeIcon icon={faChevronRight} className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="history-item-details">
                    {item.verificationResult && (
                      <div className={`verification-result ${item.verificationResult.isValid ? 'success' : 'error'}`}>
                        <div className={`verification-header ${item.verificationResult.isValid ? 'success' : 'error'}`}>
                          <FontAwesomeIcon icon={item.verificationResult.isValid ? faCheckCircle : faTimesCircle} />
                          <span>{item.verificationResult.isValid ? 'Signature Verified' : 'Verification Failed'}</span>
                        </div>
                        {item.verificationResult.signer && (
                          <div className="verification-info">
                            <strong>Recovered Signer:</strong>
                            <div className="detail-value">
                              <code className="detail-code">{item.verificationResult.signer}</code>
                              <button
                                onClick={() => handleCopy(item.verificationResult!.signer, item.id, 'signer')}
                                className={`detail-copy-btn ${
                                  copyStates[`${item.id}-signer`] === 'copied' ? 'copied' : ''
                                }`}
                                title="Copy signer address"
                              >
                                <FontAwesomeIcon icon={getCopyIcon(item.id, 'signer')} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="detail-section">
                      <div className="detail-label">Signature</div>
                      <div className="detail-value">
                        <code className="detail-code">{item.signature}</code>
                        <button
                          onClick={() => handleCopy(item.signature, item.id, 'signature')}
                          className={`detail-copy-btn ${
                            copyStates[`${item.id}-signature`] === 'copied' ? 'copied' : ''
                          }`}
                          title="Copy signature"
                        >
                          <FontAwesomeIcon icon={getCopyIcon(item.id, 'signature')} />
                        </button>
                      </div>
                    </div>

                    <div className="detail-section">
                      <div className="detail-label">Wallet Address</div>
                      <div className="detail-value">
                        <code className="detail-code">{item.walletAddress}</code>
                        <button
                          onClick={() => handleCopy(item.walletAddress, item.id, 'wallet')}
                          className={`detail-copy-btn ${copyStates[`${item.id}-wallet`] === 'copied' ? 'copied' : ''}`}
                          title="Copy wallet address"
                        >
                          <FontAwesomeIcon icon={getCopyIcon(item.id, 'wallet')} />
                        </button>
                      </div>
                    </div>

                    <div className="detail-actions">
                      <button
                        onClick={() => handleReVerify(item)}
                        className="btn btn-secondary btn-small"
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <>
                            <span className="spinner"></span>
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faSync} />
                            <span>Re-verify</span>
                          </>
                        )}
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-small">
                        <FontAwesomeIcon icon={faTrashAlt} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
