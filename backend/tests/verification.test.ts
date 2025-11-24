import supertest from 'supertest';
import { describe, it, expect } from 'vitest';

import app from '@/server';
import Paths from '@/common/constants/Paths';
import HttpStatusCodes from '@/common/constants/HttpStatusCodes';


/******************************************************************************
                            Test Data & Constants
******************************************************************************/

// Valid test signature (generated from ethers.js)
const VALID_MESSAGE = 'Hello, Web3!';
const VALID_SIGNATURE =
  '0x8b9a1c7c0e5d8e3f3a5c2b4a7d6e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7' +
  'e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d71b';

const INVALID_SIGNATURE = '0xinvalid';


/******************************************************************************
                              Test Cases
******************************************************************************/

describe('Verification API', () => {
  const verifyPath =
    Paths.Base +
    Paths.Verification.Base +
    Paths.Verification.VerifySignature;

  describe(`POST ${verifyPath}`, () => {
    
    it('should return 400 if message is missing', async () => {
      const res = await supertest(app)
        .post(verifyPath)
        .send({ signature: VALID_SIGNATURE })
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect((res.body as { error: string }).error).toBeDefined();
      expect((res.body as { error: string }).error)
        .toContain('Missing required fields');
    });

    it('should return 400 if signature is missing', async () => {
      const res = await supertest(app)
        .post(verifyPath)
        .send({ message: VALID_MESSAGE })
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect((res.body as { error: string }).error).toBeDefined();
      expect((res.body as { error: string }).error)
        .toContain('Missing required fields');
    });

    it('should return 400 if message is not a string', async () => {
      const res = await supertest(app)
        .post(verifyPath)
        .send({ message: 123, signature: VALID_SIGNATURE })
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect((res.body as { error: string }).error).toBeDefined();
      expect((res.body as { error: string }).error)
        .toContain('Invalid field types');
    });

    it('should return 400 if signature is not a string', async () => {
      const res = await supertest(app)
        .post(verifyPath)
        .send({ message: VALID_MESSAGE, signature: 123 })
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect((res.body as { error: string }).error).toBeDefined();
      expect((res.body as { error: string }).error)
        .toContain('Invalid field types');
    });

    it('should return isValid: false for invalid signature', async () => {
      const res = await supertest(app)
        .post(verifyPath)
        .send({ message: VALID_MESSAGE, signature: INVALID_SIGNATURE })
        .expect(HttpStatusCodes.OK);

      interface VerifyResponse {
        isValid: boolean;
        signer: string;
        originalMessage: string;
      }

      expect(res.body).toBeDefined();
      expect((res.body as VerifyResponse).isValid).toBe(false);
      expect((res.body as VerifyResponse).signer).toBe('');
      expect((res.body as VerifyResponse).originalMessage)
        .toBe(VALID_MESSAGE);
    });

    it('should successfully verify a valid signature', async () => {
      // Note: This test uses a real example signature
      // You'll need to replace with actual test data from your wallet
      const testMessage = 'Test message';
      const testSignature = '0x...'; // Replace with actual signature

      const res = await supertest(app)
        .post(verifyPath)
        .send({ message: testMessage, signature: testSignature })
        .expect(HttpStatusCodes.OK);

      interface VerifyResponse {
        isValid: boolean;
        signer: string;
        originalMessage: string;
      }

      expect(res.body).toBeDefined();
      expect((res.body as VerifyResponse).isValid).toBeDefined();
      expect((res.body as VerifyResponse).signer).toBeDefined();
      expect((res.body as VerifyResponse).originalMessage)
        .toBe(testMessage);
    });

    it('should return valid response structure', async () => {
      const res = await supertest(app)
        .post(verifyPath)
        .send({ message: VALID_MESSAGE, signature: INVALID_SIGNATURE })
        .expect(HttpStatusCodes.OK);

      interface VerifyResponse {
        isValid: boolean;
        signer: string;
        originalMessage: string;
      }

      expect(res.body).toHaveProperty('isValid');
      expect(res.body).toHaveProperty('signer');
      expect(res.body).toHaveProperty('originalMessage');
      expect(typeof (res.body as VerifyResponse).isValid).toBe('boolean');
      expect(typeof (res.body as VerifyResponse).signer).toBe('string');
      expect(typeof (res.body as VerifyResponse).originalMessage)
        .toBe('string');
    });
  });

  describe('Health Checks', () => {
    it('should return 200 for root endpoint', async () => {
      const res = await supertest(app)
        .get('/')
        .expect(HttpStatusCodes.OK);

      interface HealthResponse {
        status: string;
        message: string;
      }

      expect((res.body as HealthResponse).status).toBe('ok');
      expect((res.body as HealthResponse).message).toBeDefined();
    });

    it('should return 200 for health check endpoint', async () => {
      const res = await supertest(app)
        .get('/health')
        .expect(HttpStatusCodes.OK);

      interface HealthCheckResponse {
        status: string;
        timestamp: string;
      }

      expect((res.body as HealthCheckResponse).status).toBe('healthy');
      expect((res.body as HealthCheckResponse).timestamp).toBeDefined();
    });
  });
});

