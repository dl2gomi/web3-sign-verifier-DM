import type { SignedMessage } from '@/types';

const STORAGE_KEY = 'web3-signature-history';

/**
 * Save a signed message to localStorage
 * @param message - The signed message to save
 * @throws An error if the message cannot be saved
 * @returns void
 */
export function saveSignedMessage(message: SignedMessage): void {
  try {
    const history = getSignatureHistory();
    // Add new message at the beginning (newest first)
    const updatedHistory = [message, ...history];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save message to localStorage:', error);
    throw new Error('Failed to save message history');
  }
}

/**
 * Get all signed messages from localStorage
 * @returns An array of signed messages
 * @throws An error if the message history cannot be read
 */
export function getSignatureHistory(): SignedMessage[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read message history:', error);
    return [];
  }
}

/**
 * Update a specific message in history (e.g., after verification)
 * @param id - The ID of the message to update
 * @param updates - The updates to apply to the message
 * @throws An error if the message cannot be updated
 * @returns void
 */
export function updateSignedMessage(id: string, updates: Partial<SignedMessage>): void {
  try {
    const history = getSignatureHistory();
    const updatedHistory = history.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to update message:', error);
    throw new Error('Failed to update message history');
  }
}

/**
 * Delete a specific message from history
 * @param id - The ID of the message to delete
 * @throws An error if the message cannot be deleted
 * @returns void
 */
export function deleteSignedMessage(id: string): void {
  try {
    const history = getSignatureHistory();
    const updatedHistory = history.filter((msg) => msg.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to delete message:', error);
    throw new Error('Failed to delete message');
  }
}

/**
 * Clear all signed messages from localStorage
 * @throws An error if the message history cannot be cleared
 * @returns void
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
    throw new Error('Failed to clear message history');
  }
}

/**
 * Get storage size info (optional, for debugging)
 * @returns The storage size info
 * @throws An error if the storage size cannot be retrieved
 */
export function getStorageInfo(): { count: number; sizeKB: number } {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const history = getSignatureHistory();
    const sizeKB = data ? new Blob([data]).size / 1024 : 0;

    return {
      count: history.length,
      sizeKB: Math.round(sizeKB * 100) / 100,
    };
  } catch {
    return { count: 0, sizeKB: 0 };
  }
}
