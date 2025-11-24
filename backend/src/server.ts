import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';

import BaseRouter from './routes';

import Paths from './common/constants/Paths';
import HttpStatusCodes from './common/constants/HttpStatusCodes';
import { RouteError } from './common/util/route-errors';
import { NodeEnvs } from './common/constants';

/******************************************************************************
                                Setup
******************************************************************************/

const app = express();

// **** Middleware **** //

// CORS - Allow frontend to communicate with backend
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  }),
);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
if (process.env.NODE_ENV === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === NodeEnvs.Production) {
  // eslint-disable-next-line n/no-process-env
  if (!process.env.DISABLE_HELMET) {
    app.use(helmet());
  }
}

// Add APIs, must be after middleware
app.use(Paths.Base, BaseRouter);

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    res.status(status).json({ error: err.message });
  }
  return next(err);
});

// Health check endpoint
app.get('/', (_: Request, res: Response) => {
  return res.json({
    status: 'ok',
    message: 'Web3 Signature Verifier API',
    version: '1.0.0',
  });
});

// API health check
app.get('/health', (_: Request, res: Response) => {
  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

/******************************************************************************
                                Export default
******************************************************************************/

export default app;
