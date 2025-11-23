
export default {
  Base: '/api',
  Verification: {
    Base: '/v1',
    VerifySignature: '/verify-signature',
  },
  MFA: {
    Base: '/v1/mfa',
    Setup: '/setup',
    VerifySetup: '/verify-setup',
    VerifyLogin: '/verify-login',
    Disable: '/disable',
    Status: '/status',
  },
} as const;
