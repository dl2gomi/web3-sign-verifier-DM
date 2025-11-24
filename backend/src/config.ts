import dotenv from 'dotenv';
import moduleAlias from 'module-alias';
import path from 'path';

try {
  // Load .env file if it exists (development), otherwise use system env vars (production/Render)
  dotenv.config({ override: false });

  // Point @ alias to compiled dist folder
  moduleAlias.addAlias('@', path.join(__dirname));

  console.log('✓ Configuration loaded successfully');
  console.log(`✓ Module alias @ -> ${path.join(__dirname)}`);
} catch (error) {
  console.error('✗ Failed to load configuration:', error);
  throw error;
}
