import fs from 'fs'
import path from 'path'
import webpack from 'webpack'
import config from './webpack.base.config'
import WebpackAssetsManifest from 'webpack-assets-manifest'

const ROOT_DIR = path.resolve(__dirname, '..')
const resolvePath = (...args) => path.resolve(ROOT_DIR, ...args)
const DIST_DIR = resolvePath('dist')

const isDebug = !process.argv.includes('--release')
const isAnalyze =
  process.argv.includes('--analyze') || process.argv.includes('--analyse')

export default {
  ...config,

  name: 'client',
  target: 'web',

  entry: {
    client: ['@babel/polyfill', './src/client.js'],
  },

  plugins: [
    // Define free variables
    // https://webpack.js.org/plugins/define-plugin/
    new webpack.DefinePlugin({
      'process.env.BROWSER': true,
      __DEV__: isDebug,
    }),

    // Emit a file with assets paths
    // https://github.com/webdeveric/webpack-assets-manifest#options
    new WebpackAssetsManifest({
      output: `${DIST_DIR}/asset-manifest.json`,
      publicPath: true,
      writeToDisk: true,
      customize: ({ key, value }) => {
        // You can prevent adding items to the manifest by returning false.
        if (key.toLowerCase().endsWith('.map')) return false
        return { key, value }
      },
      done: (manifest, stats) => {
        // Write chunk-manifest.json.json
        const chunkFileName = `${DIST_DIR}/chunk-manifest.json`
        try {
          const fileFilter = file => !file.endsWith('.map');
          const addPath = file => manifest.getPublicPath(file);
          const chunkFiles = stats.compilation.chunkGroups.reduce((acc, c) => {
            acc[c.name] = [
              ...(acc[c.name] || []),
              ...c.chunks.reduce(
                (files, cc) => [
                  ...files,
                  ...cc.files.filter(fileFilter).map(addPath),
                ],
                [],
              ),
            ];
            return acc
          }, Object.create(null))
          fs.writeFileSync(chunkFileName, JSON.stringify(chunkFiles, null, 2))
        } catch (err) {
          console.error(`ERROR: Cannot write ${chunkFileName}: `, err)
          if (!isDebug) process.exit(1)
        }
      },
    }),

    ...(isDebug
      ? []
      : [
        // Webpack Bundle Analyzer
        // https://github.com/th0r/webpack-bundle-analyzer
        ...(isAnalyze ? [new BundleAnalyzerPlugin()] : []),
      ]),
  ],

  // Move modules that occur in multiple entry chunks to a new entry chunk (the commons chunk).
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial',
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
        },
      },
    },
  },

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  // https://webpack.js.org/configuration/node/
  // https://github.com/webpack/node-libs-browser/tree/master/mock
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
}