import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmbeddedLogin } from './EmbeddedLogin';

// Mock Dynamic SDK
const mockSetShowAuthFlow = vi.fn();

vi.mock('@dynamic-labs/sdk-react-core', () => ({
  useDynamicContext: () => ({
    setShowAuthFlow: mockSetShowAuthFlow,
  }),
}));

describe('EmbeddedLogin Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the login form', () => {
    render(<EmbeddedLogin />);

    expect(screen.getByText('Web3 Message Signer')).toBeInTheDocument();
    expect(screen.getByText('Sign in with your email to get started')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with email/i })).toBeInTheDocument();
  });

  it('should enable submit button when email is entered', () => {
    render(<EmbeddedLogin />);

    const input = screen.getByLabelText('Email Address') as HTMLInputElement;
    const button = screen.getByRole('button', { name: /continue with email/i });

    expect(button).toBeDisabled();

    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(button).not.toBeDisabled();
  });

  it('should call setShowAuthFlow on form submit', async () => {
    const onSuccess = vi.fn();
    render(<EmbeddedLogin onSuccess={onSuccess} />);

    const input = screen.getByLabelText('Email Address');
    const button = screen.getByRole('button', { name: /continue with email/i });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSetShowAuthFlow).toHaveBeenCalledWith(true);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should validate email format', () => {
    render(<EmbeddedLogin />);

    const input = screen.getByLabelText('Email Address') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'invalid-email' } });

    // HTML5 validation should prevent submission
    expect(input.validity.valid).toBe(false);
  });

  it('should accept valid email addresses', () => {
    render(<EmbeddedLogin />);

    const input = screen.getByLabelText('Email Address') as HTMLInputElement;

    // Test valid email
    fireEvent.change(input, { target: { value: 'valid@example.com' } });
    expect(input.value).toBe('valid@example.com');

    // Test another valid email
    fireEvent.change(input, { target: { value: 'user.name+tag@example.co.uk' } });
    expect(input.value).toBe('user.name+tag@example.co.uk');
  });
});

