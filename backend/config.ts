import dotenv from 'dotenv';
import moduleAlias from 'module-alias';

// Configure "dotenv" - load from backend root
// If .env doesn't exist (like on Render), that's fine - use system env vars
dotenv.config();

// Configure moduleAlias
if (__filename.endsWith('js')) {
  moduleAlias.addAlias('@', __dirname + '/dist');
}
