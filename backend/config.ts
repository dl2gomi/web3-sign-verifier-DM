import dotenv from 'dotenv';
import moduleAlias from 'module-alias';

// 1. Load .env only in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config(); // local only
}

// 2. Setup alias for compiled JS
// __dirname points to /opt/render/project/src/backend after build
moduleAlias.addAlias('@', __dirname + '/dist');
