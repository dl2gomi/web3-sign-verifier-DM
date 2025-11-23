# Backend Environment Configuration

This folder contains environment-specific configuration files for the backend.

## Setup Instructions

Create the appropriate environment file(s) for your needs:

### For Development

Create `.env.development` in this folder with the following content:

```env
# Server Port
PORT=3000

# Node Environment
NODE_ENV=development

# Frontend URL for CORS (must match your frontend dev server)
FRONTEND_URL=http://localhost:5173
```

### For Production

Create `.env.production` in this folder with the following content:

```env
# Server Port
PORT=3000

# Node Environment
NODE_ENV=production

# Frontend URL for CORS (replace with your production frontend URL)
FRONTEND_URL=https://your-frontend-domain.com
```

### For Testing

Create `.env.test` in this folder with the following content:

```env
# Server Port
PORT=3001

# Node Environment
NODE_ENV=test

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

## How It Works

The backend automatically loads the correct config file based on the `NODE_ENV` environment variable:

- `NODE_ENV=development` → loads `.env.development`
- `NODE_ENV=production` → loads `.env.production`
- `NODE_ENV=test` → loads `.env.test`

This is configured in the `config.ts` file in the backend root directory.

## Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port number for the backend server | `3000` |
| `NODE_ENV` | Environment type | `development`, `production`, or `test` |
| `FRONTEND_URL` | URL of the frontend application for CORS | `http://localhost:5173` |

## Security Note

⚠️ **Never commit actual `.env.*` files to version control!**

These files are listed in `.gitignore` and should remain private. Only commit this README file with instructions.

