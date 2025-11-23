import { useState, useEffect } from 'react';
import { MessageForm, SignatureHistory } from '@/components/Signer';
import { MFAAlert } from '@/components/MFAAlert';
import { useMFA } from '@/hooks';

export function MainPage() {
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const { isMFAEnabled } = useMFA();
  const [showMFAAlert, setShowMFAAlert] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the alert before
    const dismissed = localStorage.getItem('mfa_alert_dismissed');
    if (!isMFAEnabled && !dismissed) {
      setShowMFAAlert(true);
    }
  }, [isMFAEnabled]);

  const handleMessageSigned = () => {
    setHistoryRefresh((prev) => prev + 1);
  };

  const handleDismissAlert = () => {
    setShowMFAAlert(false);
    localStorage.setItem('mfa_alert_dismissed', 'true');
  };

  return (
    <>
      {showMFAAlert && !isMFAEnabled && <MFAAlert onDismiss={handleDismissAlert} />}
      <MessageForm onSuccess={handleMessageSigned} />
      <SignatureHistory refreshTrigger={historyRefresh} />
    </>
  );
}

