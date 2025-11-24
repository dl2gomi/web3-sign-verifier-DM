import { useState } from 'react';
import { MessageForm, SignatureHistory } from '@/components/Signer';

export function MainPage() {
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const handleMessageSigned = () => {
    setHistoryRefresh((prev) => prev + 1);
  };

  return (
    <>
      <MessageForm onSuccess={handleMessageSigned} />
      <SignatureHistory refreshTrigger={historyRefresh} />
    </>
  );
}
