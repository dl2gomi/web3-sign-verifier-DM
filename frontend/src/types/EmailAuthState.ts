export interface EmailAuthState {
  step: 'initial' | 'verification' | 'authenticated' | 'error';
  email: string | null;
  error: string | null;
}
