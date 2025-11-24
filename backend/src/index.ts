import logger from 'jet-logger';

import server from './server';
import './config';

/******************************************************************************
                                Constants
******************************************************************************/

const SERVER_START_MSG = `Express server started on port: ${process.env.PORT?.toString() ?? '3000'}`;

/******************************************************************************
                                  Run
******************************************************************************/

// Start the server
// Bind to 0.0.0.0 to accept connections from any network interface (required for Render)
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

server.listen(port, host, () => {
  logger.info(SERVER_START_MSG);
  logger.info(`Server listening on ${host}:${port}`);
});
