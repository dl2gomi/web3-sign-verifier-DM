import dotenv from 'dotenv';
import moduleAlias from 'module-alias';
import path from 'path';

// Load .env file if it exists (development), otherwise use system env vars (production/Render)
dotenv.config({ override: false });

// Point @ alias to compiled dist folder
moduleAlias.addAlias('@', path.join(__dirname));
