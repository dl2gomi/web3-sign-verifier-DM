import { ethers } from 'ethers';
import logger from 'jet-logger';

/**
 * Verification Service
 * Handles Web3 signature verification using ethers.js
 */

export interface VerificationRequest {
  message: string;
  signature: string;
}

export interface VerificationResponse {
  isValid: boolean;
  signer: string;
  originalMessage: string;
}

/**
 * Verify a Web3 signature
 * @param message - The original message that was signed
 * @param signature - The signature to verify
 * @returns Verification result with signer address
 */
async function verifySignature(
  message: string,
  signature: string,
): Promise<VerificationResponse> {
  try {
    // Recover the signer's address from the signature
    const signerAddress = ethers.verifyMessage(message, signature);

    logger.info(
      `Signature verified successfully. Signer: ${signerAddress}`,
    );

    return {
      isValid: true,
      signer: signerAddress,
      originalMessage: message,
    };
  } catch (error) {
    logger.err('Signature verification failed:', error);

    // If verification fails, return invalid result
    return {
      isValid: false,
      signer: '',
      originalMessage: message,
    };
  }
}

// **** Export default **** //

export default {
  verifySignature,
} as const;

