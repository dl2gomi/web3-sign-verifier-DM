import fs from 'fs-extra';
import logger from 'jet-logger';
import childProcess from 'child_process';

/**
 * Start
 */
(async () => {
  try {
    // Remove current build
    await remove('./dist/');
    await remove('./config.js');
    await remove('./temp/');
    // Lint the code
    await exec('npm run lint', './');
    // Compile TypeScript to temp/
    await exec('tsc --build tsconfig.prod.json', './');
    // Copy compiled files to proper locations
    await copy('./temp/config.js', './config.js');
    await copy('./temp/src', './dist');
    // Clean up temp
    await remove('./temp/');
  } catch (err) {
    logger.err(err);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
})();

/**
 * Remove file
 */
function remove(loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.remove(loc, (err) => {
      return !!err ? rej(err) : res();
    });
  });
}

/**
 * Copy file or directory
 */
function copy(src: string, dest: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.copy(src, dest, (err) => {
      return !!err ? rej(err) : res();
    });
  });
}

/**
 * Do command line command.
 */
function exec(cmd: string, loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return childProcess.exec(cmd, { cwd: loc }, (err, stdout, stderr) => {
      if (!!stdout) {
        logger.info(stdout);
      }
      if (!!stderr) {
        logger.warn(stderr);
      }
      return !!err ? rej(err) : res();
    });
  });
}
