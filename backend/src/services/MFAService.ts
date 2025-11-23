import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import logger from 'jet-logger';

// In-memory storage for MFA secrets
// Key: user identifier (email or wallet address), Value: { secret, enabled }
interface MFAData {
  secret: string;
  enabled: boolean;
  tempSecret?: string; // Temporary secret during setup
}

const mfaStore = new Map<string, MFAData>();

/**
 * Generate MFA secret and QR code for setup
 */
async function generateMFASecret(userIdentifier: string): Promise<{ secret: string; qrCodeUri: string }> {
  try {
    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `Web3 Signer (${userIdentifier})`,
      issuer: 'Web3 Signer',
      length: 20,
    });

    // Store temporary secret (not enabled yet until verified)
    const existingData = mfaStore.get(userIdentifier);
    mfaStore.set(userIdentifier, {
      secret: existingData?.secret || '',
      enabled: existingData?.enabled || false,
      tempSecret: secret.base32,
    });

    // Generate QR code
    const qrCodeUri = await QRCode.toDataURL(secret.otpauth_url!);

    logger.info(`MFA secret generated for user: ${userIdentifier}`);

    return {
      secret: secret.base32,
      qrCodeUri,
    };
  } catch (error) {
    logger.err('Failed to generate MFA secret:', error);
    throw new Error('Failed to generate MFA secret');
  }
}

/**
 * Verify MFA code during setup
 */
function verifyMFASetup(userIdentifier: string, token: string): boolean {
  try {
    const mfaData = mfaStore.get(userIdentifier);
    
    if (!mfaData?.tempSecret) {
      logger.err(`No temporary MFA secret found for user: ${userIdentifier}`);
      return false;
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: mfaData.tempSecret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after for clock skew
    });

    if (verified) {
      // Move temp secret to permanent and enable MFA
      mfaStore.set(userIdentifier, {
        secret: mfaData.tempSecret,
        enabled: true,
      });
      logger.info(`MFA enabled for user: ${userIdentifier}`);
    }

    return verified;
  } catch (error) {
    logger.err('Failed to verify MFA setup:', error);
    return false;
  }
}

/**
 * Verify MFA code during login
 */
function verifyMFALogin(userIdentifier: string, token: string): boolean {
  try {
    const mfaData = mfaStore.get(userIdentifier);
    
    if (!mfaData?.enabled || !mfaData.secret) {
      logger.err(`MFA not enabled for user: ${userIdentifier}`);
      return false;
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: mfaData.secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    logger.info(`MFA login verification for user ${userIdentifier}: ${verified ? 'success' : 'failed'}`);
    return verified;
  } catch (error) {
    logger.err('Failed to verify MFA login:', error);
    return false;
  }
}

/**
 * Disable MFA for a user
 */
function disableMFA(userIdentifier: string): boolean {
  try {
    mfaStore.delete(userIdentifier);
    logger.info(`MFA disabled for user: ${userIdentifier}`);
    return true;
  } catch (error) {
    logger.err('Failed to disable MFA:', error);
    return false;
  }
}

/**
 * Check if MFA is enabled for a user
 */
function isMFAEnabled(userIdentifier: string): boolean {
  const mfaData = mfaStore.get(userIdentifier);
  return mfaData?.enabled || false;
}

/**
 * Get MFA status for a user
 */
function getMFAStatus(userIdentifier: string): { enabled: boolean; hasSecret: boolean } {
  const mfaData = mfaStore.get(userIdentifier);
  return {
    enabled: mfaData?.enabled || false,
    hasSecret: !!(mfaData?.secret || mfaData?.tempSecret),
  };
}

export default {
  generateMFASecret,
  verifyMFASetup,
  verifyMFALogin,
  disableMFA,
  isMFAEnabled,
  getMFAStatus,
} as const;

