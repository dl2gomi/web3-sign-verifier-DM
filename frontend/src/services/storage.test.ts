import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveSignedMessage,
  getSignatureHistory,
  updateSignedMessage,
  deleteSignedMessage,
  clearHistory,
  getStorageInfo,
} from './storage';
import type { SignedMessage } from '@/types';

describe('Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveSignedMessage', () => {
    it('should save a message to localStorage', () => {
      const message: SignedMessage = {
        id: '1',
        message: 'Hello World',
        signature: '0xabc123',
        timestamp: Date.now(),
        walletAddress: '0x1234567890',
      };

      saveSignedMessage(message);

      const history = getSignatureHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(message);
    });

    it('should add new messages at the beginning (newest first)', () => {
      const message1: SignedMessage = {
        id: '1',
        message: 'First',
        signature: '0x111',
        timestamp: 1000,
        walletAddress: '0xAAA',
      };

      const message2: SignedMessage = {
        id: '2',
        message: 'Second',
        signature: '0x222',
        timestamp: 2000,
        walletAddress: '0xBBB',
      };

      saveSignedMessage(message1);
      saveSignedMessage(message2);

      const history = getSignatureHistory();
      expect(history).toHaveLength(2);
      expect(history[0].id).toBe('2'); // Newest first
      expect(history[1].id).toBe('1');
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const message: SignedMessage = {
        id: '1',
        message: 'Test',
        signature: '0x123',
        timestamp: Date.now(),
        walletAddress: '0xABC',
      };

      expect(() => saveSignedMessage(message)).toThrow('Failed to save message history');

      setItemSpy.mockRestore();
    });
  });

  describe('getSignatureHistory', () => {
    it('should return empty array when no history exists', () => {
      const history = getSignatureHistory();
      expect(history).toEqual([]);
    });

    it('should retrieve all saved messages', () => {
      const messages: SignedMessage[] = [
        {
          id: '1',
          message: 'First',
          signature: '0x111',
          timestamp: 1000,
          walletAddress: '0xAAA',
        },
        {
          id: '2',
          message: 'Second',
          signature: '0x222',
          timestamp: 2000,
          walletAddress: '0xBBB',
        },
      ];

      localStorage.setItem('web3-signature-history', JSON.stringify(messages));

      const history = getSignatureHistory();
      expect(history).toEqual(messages);
    });

    it('should return empty array for corrupted data', () => {
      localStorage.setItem('web3-signature-history', 'invalid json');
      const history = getSignatureHistory();
      expect(history).toEqual([]);
    });

    it('should return empty array if data is not an array', () => {
      localStorage.setItem('web3-signature-history', JSON.stringify({ not: 'array' }));
      const history = getSignatureHistory();
      expect(history).toEqual([]);
    });
  });

  describe('updateSignedMessage', () => {
    it('should update a specific message', () => {
      const message: SignedMessage = {
        id: '1',
        message: 'Test',
        signature: '0x123',
        timestamp: Date.now(),
        walletAddress: '0xABC',
      };

      saveSignedMessage(message);

      updateSignedMessage('1', {
        verified: true,
        verificationResult: {
          isValid: true,
          signer: '0xABC',
          originalMessage: 'Test',
        },
      });

      const history = getSignatureHistory();
      expect(history[0].verified).toBe(true);
      expect(history[0].verificationResult).toBeDefined();
    });

    it('should not modify other messages', () => {
      const message1: SignedMessage = {
        id: '1',
        message: 'First',
        signature: '0x111',
        timestamp: 1000,
        walletAddress: '0xAAA',
      };

      const message2: SignedMessage = {
        id: '2',
        message: 'Second',
        signature: '0x222',
        timestamp: 2000,
        walletAddress: '0xBBB',
      };

      saveSignedMessage(message1);
      saveSignedMessage(message2);

      updateSignedMessage('1', { verified: true });

      const history = getSignatureHistory();
      expect(history[1].verified).toBe(true); // message1 (index 1 because newest first)
      expect(history[0].verified).toBeUndefined(); // message2
    });
  });

  describe('deleteSignedMessage', () => {
    it('should delete a specific message', () => {
      const message1: SignedMessage = {
        id: '1',
        message: 'First',
        signature: '0x111',
        timestamp: 1000,
        walletAddress: '0xAAA',
      };

      const message2: SignedMessage = {
        id: '2',
        message: 'Second',
        signature: '0x222',
        timestamp: 2000,
        walletAddress: '0xBBB',
      };

      saveSignedMessage(message1);
      saveSignedMessage(message2);

      deleteSignedMessage('1');

      const history = getSignatureHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('2');
    });

    it('should handle deleting non-existent message', () => {
      const message: SignedMessage = {
        id: '1',
        message: 'Test',
        signature: '0x123',
        timestamp: Date.now(),
        walletAddress: '0xABC',
      };

      saveSignedMessage(message);
      deleteSignedMessage('999');

      const history = getSignatureHistory();
      expect(history).toHaveLength(1); // Original message still there
    });
  });

  describe('clearHistory', () => {
    it('should remove all messages', () => {
      const message1: SignedMessage = {
        id: '1',
        message: 'First',
        signature: '0x111',
        timestamp: 1000,
        walletAddress: '0xAAA',
      };

      const message2: SignedMessage = {
        id: '2',
        message: 'Second',
        signature: '0x222',
        timestamp: 2000,
        walletAddress: '0xBBB',
      };

      saveSignedMessage(message1);
      saveSignedMessage(message2);

      clearHistory();

      const history = getSignatureHistory();
      expect(history).toEqual([]);
    });

    it('should not throw error if history is already empty', () => {
      expect(() => clearHistory()).not.toThrow();
    });
  });

  describe('getStorageInfo', () => {
    it('should return count and size of stored data', () => {
      const message: SignedMessage = {
        id: '1',
        message: 'Test',
        signature: '0x123',
        timestamp: Date.now(),
        walletAddress: '0xABC',
      };

      saveSignedMessage(message);

      const info = getStorageInfo();
      expect(info.count).toBe(1);
      expect(info.sizeKB).toBeGreaterThan(0);
    });

    it('should return zeros for empty storage', () => {
      const info = getStorageInfo();
      expect(info.count).toBe(0);
      expect(info.sizeKB).toBe(0);
    });
  });
});
