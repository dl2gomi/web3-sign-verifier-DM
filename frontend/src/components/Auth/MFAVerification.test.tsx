import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MFAVerification } from './MFAVerification';

describe('MFAVerification', () => {
  it('should render verification form', () => {
    const mockOnVerifyCode = vi.fn();

    render(<MFAVerification onVerifyCode={mockOnVerifyCode} />);

    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0 0 0 0 0 0')).toBeInTheDocument();
  });

  it('should display email when provided', () => {
    const mockOnVerifyCode = vi.fn();
    const email = 'test@example.com';

    render(<MFAVerification email={email} onVerifyCode={mockOnVerifyCode} />);

    expect(screen.getByText(email)).toBeInTheDocument();
  });

  it('should handle code input correctly', () => {
    const mockOnVerifyCode = vi.fn();

    render(<MFAVerification onVerifyCode={mockOnVerifyCode} />);

    const input = screen.getByPlaceholderText('0 0 0 0 0 0');
    fireEvent.change(input, { target: { value: '654321' } });

    expect(input).toHaveValue('654321');
  });

  it('should only accept numeric input', () => {
    const mockOnVerifyCode = vi.fn();

    render(<MFAVerification onVerifyCode={mockOnVerifyCode} />);

    const input = screen.getByPlaceholderText('0 0 0 0 0 0');
    fireEvent.change(input, { target: { value: 'xyz789' } });

    expect(input).toHaveValue('789');
  });

  it('should limit input to 6 digits', () => {
    const mockOnVerifyCode = vi.fn();

    render(<MFAVerification onVerifyCode={mockOnVerifyCode} />);

    const input = screen.getByPlaceholderText('0 0 0 0 0 0');
    fireEvent.change(input, { target: { value: '1234567890' } });

    expect(input).toHaveValue('123456');
  });

  it('should call onVerifyCode when form is submitted', async () => {
    const mockOnVerifyCode = vi.fn().mockResolvedValue(true);

    render(<MFAVerification onVerifyCode={mockOnVerifyCode} />);

    const input = screen.getByPlaceholderText('0 0 0 0 0 0');
    fireEvent.change(input, { target: { value: '654321' } });

    const submitButton = screen.getByRole('button', { name: /verify & continue/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnVerifyCode).toHaveBeenCalledWith('654321');
    });
  });

  it('should show error when verification fails', async () => {
    const mockOnVerifyCode = vi.fn().mockResolvedValue(false);

    render(<MFAVerification onVerifyCode={mockOnVerifyCode} />);

    const input = screen.getByPlaceholderText('0 0 0 0 0 0');
    fireEvent.change(input, { target: { value: '111111' } });

    const submitButton = screen.getByRole('button', { name: /verify & continue/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid verification code. Please try again.')).toBeInTheDocument();
    });
  });

  it('should call onBack when back button is clicked', () => {
    const mockOnVerifyCode = vi.fn();
    const mockOnBack = vi.fn();

    render(<MFAVerification onVerifyCode={mockOnVerifyCode} onBack={mockOnBack} />);

    const backButton = screen.getByRole('button', { name: /back to login/i });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should not show back button when onBack is not provided', () => {
    const mockOnVerifyCode = vi.fn();

    render(<MFAVerification onVerifyCode={mockOnVerifyCode} />);

    expect(screen.queryByRole('button', { name: /back to login/i })).not.toBeInTheDocument();
  });
});

