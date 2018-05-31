import webpack from 'webpack'
import clientConfig from './webpack.client.config'
import serverConfig from './webpack.server.config'

/**
 * Creates application bundles from the source files.
 * @param {object} options - {showStats: boolean}
 */
function bundle(options = {
  showStats: true,
}) {
  return new Promise((resolve, reject) => {
    webpack([clientConfig, serverConfig]).run((err, stats) => {
      if (err) {
        return reject(err);
      }

      options.showStats && console.info(stats.toString(clientConfig.stats));
      if (stats.hasErrors()) {
        return reject(new Error('Webpack compilation errors'));
      }

      return resolve();
    });
  });
}

export default bundle;
