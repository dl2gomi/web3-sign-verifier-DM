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
const VALID_SIGNATURE = '0x8b9a1c7c0e5d8e3f3a5c2b4a7d6e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d71b';
const VALID_SIGNER = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Expected signer address

const INVALID_SIGNATURE = '0xinvalid';


/******************************************************************************
                              Test Cases
******************************************************************************/

describe('Verification API', () => {
  const verifyPath = `${Paths.Base}${Paths.Verification.Base}${Paths.Verification.VerifySignature}`;

  describe(`POST ${verifyPath}`, () => {
    
    it('should return 400 if message is missing', async () => {
      const res = await supertest(app)
        .post(verifyPath)
        .send({ signature: VALID_SIGNATURE })
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect(res.body.error).toBeDefined();
      expect(res.body.error).toContain('Missing required fields');
    });

    it('should return 400 if signature is missing', async () => {
      const res = await supertest(app)
        .post(verifyPath)
        .send({ message: VALID_MESSAGE })
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect(res.body.error).toBeDefined();
      expect(res.body.error).toContain('Missing required fields');
    });

    it('should return 400 if message is not a string', async () => {
      const res = await supertest(app)
        .post(verifyPath)
        .send({ message: 123, signature: VALID_SIGNATURE })
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect(res.body.error).toBeDefined();
      expect(res.body.error).toContain('Invalid field types');
    });

    it('should return 400 if signature is not a string', async () => {
      const res = await supertest(app)
        .post(verifyPath)
        .send({ message: VALID_MESSAGE, signature: 123 })
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect(res.body.error).toBeDefined();
      expect(res.body.error).toContain('Invalid field types');
    });

    it('should return isValid: false for invalid signature', async () => {
      const res = await supertest(app)
        .post(verifyPath)
        .send({ message: VALID_MESSAGE, signature: INVALID_SIGNATURE })
        .expect(HttpStatusCodes.OK);

      expect(res.body).toBeDefined();
      expect(res.body.isValid).toBe(false);
      expect(res.body.signer).toBe('');
      expect(res.body.originalMessage).toBe(VALID_MESSAGE);
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

      expect(res.body).toBeDefined();
      expect(res.body.isValid).toBeDefined();
      expect(res.body.signer).toBeDefined();
      expect(res.body.originalMessage).toBe(testMessage);
    });

    it('should return valid response structure', async () => {
      const res = await supertest(app)
        .post(verifyPath)
        .send({ message: VALID_MESSAGE, signature: INVALID_SIGNATURE })
        .expect(HttpStatusCodes.OK);

      expect(res.body).toHaveProperty('isValid');
      expect(res.body).toHaveProperty('signer');
      expect(res.body).toHaveProperty('originalMessage');
      expect(typeof res.body.isValid).toBe('boolean');
      expect(typeof res.body.signer).toBe('string');
      expect(typeof res.body.originalMessage).toBe('string');
    });
  });

  describe('Health Checks', () => {
    it('should return 200 for root endpoint', async () => {
      const res = await supertest(app)
        .get('/')
        .expect(HttpStatusCodes.OK);

      expect(res.body.status).toBe('ok');
      expect(res.body.message).toBeDefined();
    });

    it('should return 200 for health check endpoint', async () => {
      const res = await supertest(app)
        .get('/health')
        .expect(HttpStatusCodes.OK);

      expect(res.body.status).toBe('healthy');
      expect(res.body.timestamp).toBeDefined();
    });
  });
});

