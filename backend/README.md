# Web3 Signature Verifier - Backend

Backend API for verifying Web3 signatures using ethers.js.

## Features

- ✅ Signature verification using ethers.js
- ✅ RESTful API with Express
- ✅ TypeScript for type safety
- ✅ CORS enabled for frontend communication
- ✅ Comprehensive error handling
- ✅ Health check endpoints
- ✅ Unit tests with Vitest

## Prerequisites

- Node.js >= 16.0.0
- npm or yarn

## Installation

```bash
npm install
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Development with Hot Reload
```bash
npm run dev:hot
```

### Production Build
```bash
npm run build
NODE_ENV=production npm start
```

## API Endpoints

### Verify Signature
**POST** `/api/v1/verify-signature`

Verifies a Web3 signature and returns the signer address.

**Request Body:**
```json
{
  "message": "Hello, Web3!",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "isValid": true,
  "signer": "0x...",
  "originalMessage": "Hello, Web3!"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Missing or invalid parameters
- `500 Internal Server Error` - Server error

### Health Checks

**GET** `/`
Returns API status and version.

**GET** `/health`
Returns server health status.

## Testing

Run all tests:
```bash
npm test
```

## Project Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── VerificationRoutes.ts   # Verification endpoint handlers
│   │   └── index.ts                # Route aggregator
│   ├── services/
│   │   └── VerificationService.ts  # Signature verification logic
│   ├── common/
│   │   └── constants/
│   │       └── Paths.ts            # API path constants
│   ├── server.ts                   # Express server setup
│   └── index.ts                    # Entry point
├── tests/
│   └── verification.test.ts        # API tests
└── package.json
```

## Environment Variables

The backend uses environment-specific configuration files in the `config/` folder.

### Development Configuration

Create `config/.env.development`:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Production Configuration

Create `config/.env.production`:

```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### How It Works

The backend automatically loads the correct config file based on the `NODE_ENV` environment variable:
- `NODE_ENV=development` → loads `config/.env.development`
- `NODE_ENV=production` → loads `config/.env.production`
- `NODE_ENV=test` → loads `config/.env.test`

See `config.ts` in the project root for the configuration logic.

## Technology Stack

- **Framework:** Express.js
- **Language:** TypeScript
- **Signature Verification:** ethers.js
- **Testing:** Vitest + Supertest
- **Security:** Helmet, CORS

## Development

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

## API Design

The API follows RESTful principles and returns JSON responses. All endpoints use proper HTTP status codes and include error messages when applicable.

### Error Response Format
```json
{
  "error": "Error message describing what went wrong"
}
```

## Security

- CORS is configured to only allow requests from the frontend URL
- Helmet.js is enabled in production for security headers
- Input validation on all endpoints
- Proper error handling without exposing sensitive information

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Submit a pull request

## License

MIT

## Author

Edward Serrano
