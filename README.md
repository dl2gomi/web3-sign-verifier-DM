# Web3 Message Signer & Verifier

A full-stack application for signing messages with Web3 wallets and verifying signatures on the blockchain. Built with React, TypeScript, Node.js, and Dynamic.xyz for wallet authentication.

## Features

- 🔐 **Email-based Web3 Authentication** - Login with email using Dynamic.xyz embedded wallets
- ✍️ **Message Signing** - Sign any custom message with your Web3 wallet
- ✅ **Signature Verification** - Verify signatures on the backend using ethers.js
- 📜 **Signature History** - Local storage of all signed messages with verification status
- 🌓 **Dark/Light Mode** - Toggle between themes
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

### Frontend

- React 18+ with TypeScript
- Vite (build tool)
- Dynamic.xyz SDK (headless embedded wallet)
- Font Awesome (icons)
- React Hot Toast (notifications)
- Vitest + React Testing Library (testing)

### Backend

- Node.js + Express
- TypeScript
- ethers.js (signature verification)
- CORS enabled for cross-origin requests

## Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn**
- A **Dynamic.xyz** account and Environment ID ([Get one here](https://www.dynamic.xyz/))

## Project Structure

```
web3-sign-verifier/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API and storage services
│   │   ├── styles/       # CSS files
│   │   └── types/        # TypeScript type definitions
│   └── ...
├── backend/           # Node.js backend API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── common/       # Shared utilities
│   └── ...
└── README.md
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd web3-sign-verifier
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

The backend uses environment-specific configuration files located in the `backend/config/` folder.

**For Development:**

Create `backend/config/.env.development`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS) - must match your frontend dev server
FRONTEND_URL=http://localhost:5173
```

**For Production:**

Create `backend/config/.env.production`:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (for CORS) - replace with your production frontend URL
FRONTEND_URL=https://your-frontend-domain.com
```

**Note:** The backend automatically loads the correct config file based on the `NODE_ENV` environment variable:

- `NODE_ENV=development` → loads `config/.env.development`
- `NODE_ENV=production` → loads `config/.env.production`

#### Run Backend

**Development mode:**

```bash
npm run dev
```

**Development with hot reload:**

```bash
npm run dev:hot
```

**Build and run production:**

```bash
npm run build
NODE_ENV=production npm start
```

**Run tests:**

```bash
npm test
```

The backend will start on `http://localhost:3000` (or the PORT specified in your config)

#### Backend API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /api/v1/verify-signature` - Verify a Web3 signature
  - Body: `{ message: string, signature: string }`
  - Response: `{ isValid: boolean, signer: string, originalMessage: string }`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Dynamic.xyz Configuration
VITE_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id-here

# Backend API Configuration
VITE_BACKEND_API_URL=http://localhost:3000
VITE_API_VERSION=v1
```

**Important:** Replace `your-dynamic-environment-id-here` with your actual Dynamic.xyz Environment ID.

To get your Dynamic.xyz Environment ID:

1. Go to [Dynamic.xyz Dashboard](https://app.dynamic.xyz/)
2. Create a new project or select an existing one
3. Copy the Environment ID from the dashboard

#### Run Frontend

**Development mode:**

```bash
npm run dev
```

**Build for production:**

```bash
npm run build
```

**Preview production build:**

```bash
npm run preview
```

**Run tests:**

```bash
npm test
```

**Check test coverage:**

```bash
npm run test:coverage
```

The frontend will start on `http://localhost:5173`

## Using the Application

1. **Login**: Open `http://localhost:5173` in your browser and enter your email to create/access an embedded wallet
2. **Sign Message**: Enter any message in the text area and click "Sign & Verify"
3. **View History**: All signed messages appear below with their verification status
4. **Copy/Re-verify**: Expand any history item to see details, copy values, or re-verify signatures
5. **Dark Mode**: Toggle the theme using the sun/moon icon in the header

## Development

### Code Quality

Both frontend and backend use:

- **TypeScript** for type safety
- **ESLint** for code linting
- **Vitest** for unit testing

### Frontend Testing

```bash
cd frontend
npm test              # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Backend Testing

```bash
cd backend
npm test              # Run tests
```

### Type Checking

```bash
# Frontend
cd frontend
npm run type-check

# Backend
cd backend
npm run type-check
```

## Production Deployment

### Backend Deployment

#### Option 1: Deploy to Render.com (Recommended)

1. Push your code to GitHub

2. Create a new Web Service on Render.com:
   - Connect your GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install --production=false && npm run build`
   - Start Command: `npm start`

3. Set the following environment variables in Render dashboard:
   ```
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://your-frontend-domain.com
   ```

4. Deploy! Render will automatically build and start your backend.

#### Option 2: Manual Deployment (VPS, AWS, etc.)

1. Build the project:

   ```bash
   cd backend
   npm run build
   ```

2. Create a `.env` file in the backend root directory:

   ```env
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://your-frontend-domain.com
   ```

3. Start the server:

   ```bash
   npm start
   ```

### Frontend Deployment

1. Build the project:

   ```bash
   cd frontend
   npm run build
   ```

2. The `dist` folder contains the production-ready static files

3. Deploy to any static hosting service (Vercel, Netlify, AWS S3, etc.)

4. Update the `.env` variables to point to your production backend:
   ```env
   VITE_BACKEND_API_URL=https://your-backend-domain.com
   ```

## Troubleshooting

### Backend Issues

**Port already in use:**

- Change the `PORT` in `.env` to a different port
- Or kill the process using port 3000

**CORS errors:**

- Ensure `FRONTEND_URL` in `backend/config/.env.development` (or `.env.production`) matches your frontend URL exactly
- Check that the correct environment file is being loaded based on `NODE_ENV`

### Frontend Issues

**Dynamic.xyz authentication fails:**

- Verify your `VITE_DYNAMIC_ENVIRONMENT_ID` is correct
- Check that the environment is enabled in Dynamic.xyz dashboard

**API calls fail:**

- Ensure backend is running
- Check `VITE_BACKEND_API_URL` points to the correct backend URL
- Verify CORS is configured correctly on the backend

**Build errors:**

- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

## License

MIT License - feel free to use this project for learning or production.

## Author

Created by Edward Serrano

- Email: eds951122@hotmail.com
- GitHub: [dl2gomi](https://github.com/dl2gomi)
