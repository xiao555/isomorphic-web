import { cleanDir } from './lib/fs';

/**
 * Cleans up the output (dist) directory.
 */
function clean() {
  return Promise.all([
    cleanDir('dist/*', {
      nosort: true,
      dot: true,
      ignore: ['dist/.git'],
    }),
  ]);
}

export default clean;
