import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignatureHistory } from './SignatureHistory';
import * as storageService from '@/services/storage';
import * as apiService from '@/services/api';
import type { SignedMessage } from '@/types';

vi.mock('@/services/storage');
vi.mock('@/services/api');

const mockHistory: SignedMessage[] = [
  {
    id: '1',
    message: 'Hello World',
    signature: '0xabc123',
    timestamp: Date.now() - 60000, // 1 minute ago
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    verified: true,
    verificationResult: {
      isValid: true,
      signer: '0x1234567890abcdef1234567890abcdef12345678',
      originalMessage: 'Hello World',
    },
  },
  {
    id: '2',
    message: 'Test Message',
    signature: '0xdef456',
    timestamp: Date.now() - 120000, // 2 minutes ago
    walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    verified: false,
    verificationResult: {
      isValid: false,
      signer: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      originalMessage: 'Test Message',
    },
  },
];

describe('SignatureHistory Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.verifySignature).mockResolvedValue({
      isValid: true,
      signer: '0x1234567890abcdef1234567890abcdef12345678',
      originalMessage: 'Hello World',
    });
  });

  it('should show empty state when no history', () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue([]);

    render(<SignatureHistory />);

    expect(screen.getByText('No signatures yet. Sign your first message above!')).toBeInTheDocument();
  });

  it('should display history items', () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);

    render(<SignatureHistory />);

    expect(screen.getByText('Signature History')).toBeInTheDocument();
    expect(screen.getByText('2 messages')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should show verification badges', () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);

    render(<SignatureHistory />);

    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should expand item details when clicked', () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);

    render(<SignatureHistory />);

    // Initially, signature details should not be visible
    expect(screen.queryByText(/0xabc123/)).not.toBeInTheDocument();

    // Click to expand
    const firstItem = screen.getByText('Hello World').closest('.history-item-header');
    fireEvent.click(firstItem!);

    // Now signature should be visible
    expect(screen.getByText(/0xabc123/)).toBeInTheDocument();
  });

  it('should call clearHistory when Clear All is clicked', () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);
    vi.mocked(storageService.clearHistory).mockImplementation(() => {});

    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    render(<SignatureHistory />);

    const clearButton = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearButton);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to clear all signature history?');
    expect(storageService.clearHistory).toHaveBeenCalled();
  });

  it('should not clear history when confirm is cancelled', () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);

    window.confirm = vi.fn(() => false);

    render(<SignatureHistory />);

    const clearButton = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearButton);

    expect(storageService.clearHistory).not.toHaveBeenCalled();
  });

  it('should format timestamps correctly', () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);

    render(<SignatureHistory />);

    expect(screen.getByText('1 minute ago')).toBeInTheDocument();
    expect(screen.getByText('2 minutes ago')).toBeInTheDocument();
  });

  it('should truncate long messages in preview', () => {
    const longMessage = 'A'.repeat(100);
    const longHistory: SignedMessage[] = [
      {
        id: '1',
        message: longMessage,
        signature: '0xabc',
        timestamp: Date.now(),
        walletAddress: '0x123',
      },
    ];

    vi.mocked(storageService.getSignatureHistory).mockReturnValue(longHistory);

    render(<SignatureHistory />);

    // The component now shows full message, not truncated in preview
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('should collapse expanded item when clicked again', () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);

    render(<SignatureHistory />);

    const firstItem = screen.getByText('Hello World').closest('.history-item-header');

    // Expand
    fireEvent.click(firstItem!);
    expect(screen.getByText(/0xabc123/)).toBeInTheDocument();

    // Collapse
    fireEvent.click(firstItem!);
    expect(screen.queryByText(/0xabc123/)).not.toBeInTheDocument();
  });

  it('should copy signature to clipboard', async () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });

    render(<SignatureHistory />);

    // Expand first item
    const firstItem = screen.getByText('Hello World').closest('.history-item-header');
    fireEvent.click(firstItem!);

    // Click copy signature button
    const copyButtons = screen.getAllByTitle('Copy signature');
    fireEvent.click(copyButtons[0]);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('0xabc123');
  });

  it('should copy wallet address to clipboard', async () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });

    render(<SignatureHistory />);

    // Expand first item
    const firstItem = screen.getByText('Hello World').closest('.history-item-header');
    fireEvent.click(firstItem!);

    // Click copy wallet address button
    const copyButtons = screen.getAllByTitle('Copy wallet address');
    fireEvent.click(copyButtons[0]);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('0x1234567890abcdef1234567890abcdef12345678');
  });

  it('should copy recovered signer to clipboard', async () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });

    render(<SignatureHistory />);

    // Expand first item (has verification result)
    const firstItem = screen.getByText('Hello World').closest('.history-item-header');
    fireEvent.click(firstItem!);

    // Click copy signer button
    const copyButtons = screen.getAllByTitle('Copy signer address');
    fireEvent.click(copyButtons[0]);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('0x1234567890abcdef1234567890abcdef12345678');
  });

  it('should delete a message when confirmed', () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);
    vi.mocked(storageService.deleteSignedMessage).mockImplementation(() => {});

    window.confirm = vi.fn(() => true);

    render(<SignatureHistory />);

    // Expand first item
    const firstItem = screen.getByText('Hello World').closest('.history-item-header');
    fireEvent.click(firstItem!);

    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]); // Last delete button (in details)

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this signature?');
    expect(storageService.deleteSignedMessage).toHaveBeenCalledWith('1');
  });

  it('should not delete a message when cancelled', () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);

    window.confirm = vi.fn(() => false);

    render(<SignatureHistory />);

    // Expand first item
    const firstItem = screen.getByText('Hello World').closest('.history-item-header');
    fireEvent.click(firstItem!);

    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    expect(storageService.deleteSignedMessage).not.toHaveBeenCalled();
  });

  it('should call verifyMessage when Re-verify is clicked', async () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);

    render(<SignatureHistory />);

    // Expand first item
    const firstItem = screen.getByText('Hello World').closest('.history-item-header');
    fireEvent.click(firstItem!);

    // Click re-verify button
    const reVerifyButton = screen.getByRole('button', { name: /re-verify/i });
    fireEvent.click(reVerifyButton);

    await waitFor(() => {
      expect(apiService.verifySignature).toHaveBeenCalledWith('Hello World', '0xabc123');
    });
  });

  it('should format "Just now" for very recent timestamps', () => {
    const recentHistory: SignedMessage[] = [
      {
        id: '1',
        message: 'Recent',
        signature: '0xabc',
        timestamp: Date.now() - 30000, // 30 seconds ago
        walletAddress: '0x123',
      },
    ];

    vi.mocked(storageService.getSignatureHistory).mockReturnValue(recentHistory);

    render(<SignatureHistory />);

    expect(screen.getByText('30 seconds ago')).toBeInTheDocument();
  });

  it('should format hours correctly', () => {
    const hoursHistory: SignedMessage[] = [
      {
        id: '1',
        message: 'Hours ago',
        signature: '0xabc',
        timestamp: Date.now() - 3600000 * 2, // 2 hours ago
        walletAddress: '0x123',
      },
      {
        id: '2',
        message: 'One hour ago',
        signature: '0xdef',
        timestamp: Date.now() - 3600000, // 1 hour ago
        walletAddress: '0x456',
      },
    ];

    vi.mocked(storageService.getSignatureHistory).mockReturnValue(hoursHistory);

    render(<SignatureHistory />);

    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
  });

  it('should format days correctly', () => {
    const daysHistory: SignedMessage[] = [
      {
        id: '1',
        message: 'Days ago',
        signature: '0xabc',
        timestamp: Date.now() - 86400000 * 3, // 3 days ago
        walletAddress: '0x123',
      },
      {
        id: '2',
        message: 'One day ago',
        signature: '0xdef',
        timestamp: Date.now() - 86400000, // 1 day ago
        walletAddress: '0x456',
      },
    ];

    vi.mocked(storageService.getSignatureHistory).mockReturnValue(daysHistory);

    render(<SignatureHistory />);

    expect(screen.getByText('3 days ago')).toBeInTheDocument();
    expect(screen.getByText('1 day ago')).toBeInTheDocument();
  });

  it('should format date for old timestamps', () => {
    const oldDate = new Date('2024-01-15');
    const oldHistory: SignedMessage[] = [
      {
        id: '1',
        message: 'Old message',
        signature: '0xabc',
        timestamp: oldDate.getTime(),
        walletAddress: '0x123',
      },
    ];

    vi.mocked(storageService.getSignatureHistory).mockReturnValue(oldHistory);

    render(<SignatureHistory />);

    // Calculate days ago from the old date
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - oldDate.getTime()) / 86400000);
    expect(screen.getByText(`${diffInDays} days ago`)).toBeInTheDocument();
  });

  it('should show singular "message" when count is 1', () => {
    const singleHistory: SignedMessage[] = [
      {
        id: '1',
        message: 'Only one',
        signature: '0xabc',
        timestamp: Date.now(),
        walletAddress: '0x123',
      },
    ];

    vi.mocked(storageService.getSignatureHistory).mockReturnValue(singleHistory);

    render(<SignatureHistory />);

    expect(screen.getByText('1 message')).toBeInTheDocument();
  });

  it('should not show verification badge when verified is undefined', () => {
    const unverifiedHistory: SignedMessage[] = [
      {
        id: '1',
        message: 'No verification',
        signature: '0xabc',
        timestamp: Date.now(),
        walletAddress: '0x123',
        // No verified property
      },
    ];

    vi.mocked(storageService.getSignatureHistory).mockReturnValue(unverifiedHistory);

    render(<SignatureHistory />);

    expect(screen.queryByText('✓ Verified')).not.toBeInTheDocument();
    expect(screen.queryByText('✗ Invalid')).not.toBeInTheDocument();
  });

  it('should not show recovered signer section when verificationResult is missing', () => {
    const noVerificationResult: SignedMessage[] = [
      {
        id: '1',
        message: 'No result',
        signature: '0xabc',
        timestamp: Date.now(),
        walletAddress: '0x123',
        verified: true,
        // No verificationResult
      },
    ];

    vi.mocked(storageService.getSignatureHistory).mockReturnValue(noVerificationResult);

    render(<SignatureHistory />);

    // Expand item
    const firstItem = screen.getByText('No result').closest('.history-item-header');
    fireEvent.click(firstItem!);

    expect(screen.queryByText('Recovered Signer')).not.toBeInTheDocument();
  });

  it('should reload history when refreshTrigger changes', () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);

    const { rerender } = render(<SignatureHistory refreshTrigger={0} />);

    expect(storageService.getSignatureHistory).toHaveBeenCalledTimes(1);

    // Change refreshTrigger
    rerender(<SignatureHistory refreshTrigger={1} />);

    expect(storageService.getSignatureHistory).toHaveBeenCalledTimes(2);
  });

  it('should disable re-verify button when verification is loading', async () => {
    vi.mocked(storageService.getSignatureHistory).mockReturnValue(mockHistory);

    // Make the API call take some time
    let resolveVerify: () => void;
    const verifyPromise = new Promise<any>((resolve) => {
      resolveVerify = () =>
        resolve({
          isValid: true,
          signer: '0x1234567890abcdef1234567890abcdef12345678',
          originalMessage: 'Hello World',
        });
    });
    vi.mocked(apiService.verifySignature).mockReturnValue(verifyPromise);

    render(<SignatureHistory />);

    // Expand first item
    const firstItem = screen.getByText('Hello World').closest('.history-item-header');
    fireEvent.click(firstItem!);

    // Click re-verify button
    const reVerifyButton = screen.getByRole('button', { name: /re-verify/i });
    fireEvent.click(reVerifyButton);

    // Button should be disabled during loading
    await waitFor(() => {
      expect(reVerifyButton).toBeDisabled();
      expect(screen.getByText('Verifying...')).toBeInTheDocument();
    });

    // Resolve the promise
    resolveVerify!();

    // Button should be enabled again after loading
    await waitFor(() => {
      expect(reVerifyButton).not.toBeDisabled();
    });
  });
});
