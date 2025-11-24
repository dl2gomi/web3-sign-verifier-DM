import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageForm } from './MessageForm';

const mockSignAndVerify = vi.fn();
const mockClearError = vi.fn();

vi.mock('@/hooks/useMessageSigning', () => ({
  useMessageSigning: () => ({
    signAndVerify: mockSignAndVerify,
    isLoading: false,
    error: null,
    clearError: mockClearError,
  }),
}));

describe('MessageForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the message form', () => {
    render(<MessageForm />);

    expect(screen.getByText('Sign Message')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign & verify/i })).toBeInTheDocument();
  });

  it('should enable submit button when message is entered', () => {
    render(<MessageForm />);

    const textarea = screen.getByLabelText('Your Message') as HTMLTextAreaElement;
    const button = screen.getByRole('button', { name: /sign & verify/i });

    expect(button).toBeDisabled();

    fireEvent.change(textarea, { target: { value: 'Hello World' } });

    expect(button).not.toBeDisabled();
  });

  it('should show character count', () => {
    render(<MessageForm />);

    const textarea = screen.getByLabelText('Your Message');

    expect(screen.getByText('0 / 500 characters')).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: 'Hello' } });

    expect(screen.getByText('5 / 500 characters')).toBeInTheDocument();
  });

  it('should call signAndVerify on form submit', async () => {
    mockSignAndVerify.mockResolvedValue({
      isValid: true,
      signer: '0x1234567890abcdef1234567890abcdef12345678',
      originalMessage: 'Hello World',
    });

    const onSuccess = vi.fn();
    render(<MessageForm onSuccess={onSuccess} />);

    const textarea = screen.getByLabelText('Your Message');
    const button = screen.getByRole('button', { name: /sign & verify/i });

    fireEvent.change(textarea, { target: { value: 'Hello World' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignAndVerify).toHaveBeenCalledWith('Hello World');
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should show success message after signing', async () => {
    mockSignAndVerify.mockResolvedValue({
      isValid: true,
      signer: '0x1234567890abcdef1234567890abcdef12345678',
      originalMessage: 'Test',
    });

    render(<MessageForm />);

    const textarea = screen.getByLabelText('Your Message');
    fireEvent.change(textarea, { target: { value: 'Test' } });

    const button = screen.getByRole('button', { name: /sign & verify/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Signature Verified!')).toBeInTheDocument();
      expect(screen.getByText(/0x1234...5678/)).toBeInTheDocument();
    });
  });

  it('should clear form after successful submission', async () => {
    mockSignAndVerify.mockResolvedValue({
      isValid: true,
      signer: '0x123',
      originalMessage: 'Test',
    });

    render(<MessageForm />);

    const textarea = screen.getByLabelText('Your Message') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Test' } });

    expect(textarea.value).toBe('Test');

    const button = screen.getByRole('button', { name: /sign & verify/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  it('should clear form when Clear button is clicked', () => {
    render(<MessageForm />);

    const textarea = screen.getByLabelText('Your Message') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Test message' } });

    expect(textarea.value).toBe('Test message');

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(textarea.value).toBe('');
  });

  it('should enforce character limit', () => {
    render(<MessageForm />);

    const textarea = screen.getByLabelText('Your Message') as HTMLTextAreaElement;

    expect(textarea.maxLength).toBe(500);
  });
});

