import logger from 'jet-logger';

// Load config first
import './config';

/******************************************************************************
                                  Run
******************************************************************************/

async function startServer() {
  try {
    // Import server after config is loaded
    const { default: server } = await import('./server');

    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    logger.info(`Starting server on ${host}:${port}...`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

    const httpServer = server.listen(port, host, () => {
      logger.info(`✓ Express server started on port: ${port}`);
      logger.info(`✓ Server listening on ${host}:${port}`);
    });

    // Handle server errors
    httpServer.on('error', (err: Error) => {
      logger.err(err);
      console.error('Server error:', err);
      // eslint-disable-next-line n/no-process-exit
      process.exit(1);
    });
  } catch (error) {
    logger.err(error as Error);
    console.error('Failed to start server:', error);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.err(err);
  console.error('Uncaught exception:', err);
  // eslint-disable-next-line n/no-process-exit
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.err(err as Error);
  console.error('Unhandled rejection:', err);
  // eslint-disable-next-line n/no-process-exit
  process.exit(1);
});

// Start the server
startServer();
