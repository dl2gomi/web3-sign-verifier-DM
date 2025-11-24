export interface AuthState {
  isAuthenticated: boolean;
  walletAddress: string | null;
  userId: string | null;
  email: string | null;
}
