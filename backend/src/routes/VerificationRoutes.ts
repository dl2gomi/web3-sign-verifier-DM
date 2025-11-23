import { Request, Response } from 'express';
import HttpStatusCodes from '@/common/constants/HttpStatusCodes';
import { VerificationService } from '@/services';

/**
 * Verify a Web3 signature
 */
function verifySignature(req: Request, res: Response) {
  const { message, signature } = req.body as {
    message: string,
    signature: string,
  };

  // Validate request
  if (!message || !signature) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Missing required fields: message and signature',
    });
  }

  if (typeof message !== 'string' || typeof signature !== 'string') {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Invalid field types: message and signature must be strings',
    });
  }

  try {
    // Verify the signature
    const result = VerificationService.verifySignature(message, signature);

    return res.status(HttpStatusCodes.OK).json(result);
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'An error occurred during signature verification',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// **** Export default **** //

export default {
  verifySignature,
} as const;
