import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MFASetup } from './MFASetup';

describe('MFASetup', () => {
  it('should render QR code when uri is provided', () => {
    const mockQrCodeUri = 'https://example.com/qr-code.png';
    const mockOnVerifyCode = vi.fn();

    render(<MFASetup qrCodeUri={mockQrCodeUri} onVerifyCode={mockOnVerifyCode} />);

    expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByAltText('MFA QR Code')).toHaveAttribute('src', mockQrCodeUri);
  });

  it('should show loading state when QR code is not yet provided', () => {
    const mockOnVerifyCode = vi.fn();

    render(<MFASetup onVerifyCode={mockOnVerifyCode} />);

    expect(screen.getByText('Generating QR code...')).toBeInTheDocument();
  });

  it('should handle code input correctly', () => {
    const mockQrCodeUri = 'https://example.com/qr-code.png';
    const mockOnVerifyCode = vi.fn();

    render(<MFASetup qrCodeUri={mockQrCodeUri} onVerifyCode={mockOnVerifyCode} />);

    const input = screen.getByPlaceholderText('0 0 0 0 0 0');
    fireEvent.change(input, { target: { value: '123456' } });

    expect(input).toHaveValue('123456');
  });

  it('should only accept numeric input', () => {
    const mockQrCodeUri = 'https://example.com/qr-code.png';
    const mockOnVerifyCode = vi.fn();

    render(<MFASetup qrCodeUri={mockQrCodeUri} onVerifyCode={mockOnVerifyCode} />);

    const input = screen.getByPlaceholderText('0 0 0 0 0 0');
    fireEvent.change(input, { target: { value: 'abc123' } });

    expect(input).toHaveValue('123');
  });

  it('should call onVerifyCode when form is submitted with valid code', async () => {
    const mockQrCodeUri = 'https://example.com/qr-code.png';
    const mockOnVerifyCode = vi.fn().mockResolvedValue(true);

    render(<MFASetup qrCodeUri={mockQrCodeUri} onVerifyCode={mockOnVerifyCode} />);

    const input = screen.getByPlaceholderText('0 0 0 0 0 0');
    fireEvent.change(input, { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: /enable mfa/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnVerifyCode).toHaveBeenCalledWith('123456');
    });
  });

  it('should call onSkip when skip button is clicked', () => {
    const mockQrCodeUri = 'https://example.com/qr-code.png';
    const mockOnVerifyCode = vi.fn();
    const mockOnSkip = vi.fn();

    render(<MFASetup qrCodeUri={mockQrCodeUri} onVerifyCode={mockOnVerifyCode} onSkip={mockOnSkip} />);

    const skipButton = screen.getByRole('button', { name: /skip for now/i });
    fireEvent.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('should disable submit button when code is incomplete', () => {
    const mockQrCodeUri = 'https://example.com/qr-code.png';
    const mockOnVerifyCode = vi.fn();

    render(<MFASetup qrCodeUri={mockQrCodeUri} onVerifyCode={mockOnVerifyCode} />);

    const submitButton = screen.getByRole('button', { name: /enable mfa/i });
    expect(submitButton).toBeDisabled();

    const input = screen.getByPlaceholderText('0 0 0 0 0 0');
    fireEvent.change(input, { target: { value: '12345' } });

    expect(submitButton).toBeDisabled();

    fireEvent.change(input, { target: { value: '123456' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('should show error when verification fails', async () => {
    const mockQrCodeUri = 'https://example.com/qr-code.png';
    const mockOnVerifyCode = vi.fn().mockResolvedValue(false);

    render(<MFASetup qrCodeUri={mockQrCodeUri} onVerifyCode={mockOnVerifyCode} />);

    const input = screen.getByPlaceholderText('0 0 0 0 0 0');
    fireEvent.change(input, { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: /enable mfa/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid verification code. Please try again.')).toBeInTheDocument();
    });
  });
});

