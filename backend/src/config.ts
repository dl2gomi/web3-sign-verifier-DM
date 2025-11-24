import dotenv from 'dotenv';
import moduleAlias from 'module-alias';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

// Point @ alias to compiled dist folder
moduleAlias.addAlias('@', path.join(__dirname));
