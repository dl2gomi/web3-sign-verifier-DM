import { Request, Response } from 'express';
import HttpStatusCodes from '@/common/constants/HttpStatusCodes';
import { MFAService } from '@/services';

/**
 * POST /api/v1/mfa/setup
 * Generate MFA secret and QR code
 */
async function setupMFA(req: Request, res: Response) {
  const { userIdentifier } = req.body;

  if (!userIdentifier || typeof userIdentifier !== 'string') {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Missing required field: userIdentifier (email or wallet address)',
    });
  }

  try {
    const { secret, qrCodeUri } = await MFAService.generateMFASecret(userIdentifier);
    
    return res.status(HttpStatusCodes.OK).json({
      secret,
      qrCodeUri,
      message: 'MFA setup initiated. Please verify with your authenticator app.',
    });
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to setup MFA',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/v1/mfa/verify-setup
 * Verify MFA code during setup
 */
async function verifySetup(req: Request, res: Response) {
  const { userIdentifier, token } = req.body;

  if (!userIdentifier || !token) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Missing required fields: userIdentifier and token',
    });
  }

  if (typeof token !== 'string' || token.length !== 6) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Token must be a 6-digit string',
    });
  }

  try {
    const verified = MFAService.verifyMFASetup(userIdentifier, token);
    
    if (verified) {
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: 'MFA enabled successfully',
      });
    } else {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid verification code',
      });
    }
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to verify MFA setup',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/v1/mfa/verify-login
 * Verify MFA code during login
 */
async function verifyLogin(req: Request, res: Response) {
  const { userIdentifier, token } = req.body;

  if (!userIdentifier || !token) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Missing required fields: userIdentifier and token',
    });
  }

  if (typeof token !== 'string' || token.length !== 6) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Token must be a 6-digit string',
    });
  }

  try {
    const verified = MFAService.verifyMFALogin(userIdentifier, token);
    
    if (verified) {
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: 'MFA verification successful',
      });
    } else {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid verification code',
      });
    }
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to verify MFA login',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/v1/mfa/disable
 * Disable MFA for a user
 */
async function disableMFA(req: Request, res: Response) {
  const { userIdentifier } = req.body;

  if (!userIdentifier || typeof userIdentifier !== 'string') {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Missing required field: userIdentifier',
    });
  }

  try {
    const success = MFAService.disableMFA(userIdentifier);
    
    if (success) {
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: 'MFA disabled successfully',
      });
    } else {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to disable MFA',
      });
    }
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to disable MFA',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/v1/mfa/status
 * Get MFA status for a user
 */
async function getStatus(req: Request, res: Response) {
  const { userIdentifier } = req.query;

  if (!userIdentifier || typeof userIdentifier !== 'string') {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Missing required query parameter: userIdentifier',
    });
  }

  try {
    const status = MFAService.getMFAStatus(userIdentifier);
    
    return res.status(HttpStatusCodes.OK).json(status);
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to get MFA status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default {
  setupMFA,
  verifySetup,
  verifyLogin,
  disableMFA,
  getStatus,
} as const;

