import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletInfo } from './WalletInfo';

// Mock Dynamic SDK
const mockHandleLogOut = vi.fn();
const mockPrimaryWallet = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
};
const mockUser = {
  email: 'test@example.com',
};

vi.mock('@dynamic-labs/sdk-react-core', () => ({
  useDynamicContext: () => ({
    primaryWallet: mockPrimaryWallet,
    user: mockUser,
    handleLogOut: mockHandleLogOut,
  }),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

describe('WalletInfo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render wallet address', () => {
    render(<WalletInfo />);

    expect(screen.getByText('Connected Wallet')).toBeInTheDocument();
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
  });

  it('should render user email if available', () => {
    render(<WalletInfo />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should copy address to clipboard when copy button is clicked', async () => {
    render(<WalletInfo />);

    const copyButton = screen.getByTitle('Copy address');

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        '0x1234567890abcdef1234567890abcdef12345678'
      );
    });

    // Should show checkmark after copying
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should call handleLogOut when logout button is clicked', () => {
    render(<WalletInfo />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });

    fireEvent.click(logoutButton);

    expect(mockHandleLogOut).toHaveBeenCalled();
  });

  it('should truncate long wallet addresses', () => {
    render(<WalletInfo />);

    const addressElement = screen.getByText('0x1234...5678');

    expect(addressElement).toBeInTheDocument();
    expect(addressElement).not.toHaveTextContent(mockPrimaryWallet.address);
  });
});

