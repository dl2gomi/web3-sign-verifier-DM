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
server.listen(process.env.PORT ?? 3000, (err) => {
  if (!!err) {
    logger.err(err.message);
  } else {
    logger.info(SERVER_START_MSG);
  }
});
