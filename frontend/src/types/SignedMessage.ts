import type { VerificationResponse } from './VerificationResponse';

export interface SignedMessage {
  id: string;
  message: string;
  signature: string;
  timestamp: number;
  walletAddress: string;
  verified?: boolean;
  verificationResult?: VerificationResponse;
}
