
import pkg from '../package.json'
import path from 'path'

const ROOT_DIR = path.resolve(__dirname, '..')
const resolvePath = (...args) => path.resolve(ROOT_DIR, ...args)
const DIST_DIR = resolvePath('dist')
const SRC_DIR = resolvePath('src')

const isDebug = !process.argv.includes('--release')
const isVerbose = process.argv.includes('--verbose')

const reScript = /\.(js|jsx|mjs)$/
const reStyle = /\.(css|less|styl|scss|sass|sss)$/
const reImage = /\.(bmp|gif|jpg|jpeg|png|svg)$/
const staticAssetName = isDebug
  ? '[path][name].[ext]?[hash:8]'
  : '[hash:8].[ext]'

// CSS Nano options http://cssnano.co/
const minimizeCssOptions = {
  discardComments: { removeAll: true },
}

export default {
  context: ROOT_DIR,
  
  mode: isDebug ? 'development' : 'production',

  output: {
    path: resolvePath(DIST_DIR, 'public/assets'),
    publicPath: '/assets/',
    pathinfo: isVerbose,
    filename: isDebug ? '[name].js' : '[name].[chunkhash:8].js',
    chunkFilename: isDebug
      ? '[name].chunk.js'
      : '[name].[chunkhash:8].chunk.js',
    // Point sourcemap entries to original disk location (format as URL on Windows)
    // devtoolModuleFilenameTemplate: info => {
    //   console.log('devtoolModuleFilenameTemplate: ', info);
    //   return path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
    // }
  },

  resolve: {
    modules: ['node_modules', 'src'],
    alias: {
      '@': resolvePath(SRC_DIR, 'components')
    }
  },

  module: {
    // Make missing exports an error instead of warning
    strictExportPresence: true,

    rules: [
      // Rules for JS / JSX
      {
        test: reScript,
        include: [SRC_DIR],
        loader: 'babel-loader',
        options: {
          // Cache transformations to the filesystem
          // https://github.com/babel/babel-loader#options
          cacheDirectory: isDebug,
          // https://babeljs.io/docs/usage/options/
          babelrc: false,
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  browsers: pkg.browserslist,
                  forceAllTransforms: !isDebug, // for UglifyJS
                },
                // Not transform modules
                modules: false,
              },
            ],
            // Experimental ECMAScript proposals
            // https://babeljs.io/docs/plugins/#presets-stage-x-experimental-presets-
            ["@babel/preset-stage-2", {
              "useBuiltIns": true,
              "decoratorsLegacy": true
            }],
            // Flow
            // https://github.com/babel/babel/tree/master/packages/babel-preset-flow
            '@babel/preset-flow',
            // JSX
            // https://github.com/babel/babel/tree/master/packages/babel-preset-react
            ['@babel/preset-react', { development: isDebug }],
          ],
          plugins: [
            // Treat React JSX elements as value types and hoist them to the highest scope
            // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-constant-elements
            ...(isDebug ? [] : ['@babel/transform-react-constant-elements']),
            // Replaces the React.createElement function with one that is more optimized for production
            // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-inline-elements
            ...(isDebug ? [] : ['@babel/transform-react-inline-elements']),
            // Remove unnecessary React propTypes from the production build
            // https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types
            ...(isDebug ? [] : ['transform-react-remove-prop-types']),
          ],
        },
      },

      // Rules for Style Sheets
      {
        test: reStyle,
        rules: [
          // Convert CSS into JS module
          {
            // https://www.webpackjs.com/configuration/module/#rule-issuer
            issuer: { not: [reStyle] },
            use: 'isomorphic-style-loader',
          },

          // Process external/third-party styles
          {
            exclude: SRC_DIR,
            loader: 'css-loader',
            options: {
              sourceMap: isDebug,
              minimize: isDebug ? false : minimizeCssOptions,
            },
          },

          // Process internal/project styles (from src folder)
          {
            include: SRC_DIR,
            loader: 'css-loader',
            options: {
              // CSS Loader https://github.com/webpack/css-loader
              importLoaders: 1,
              sourceMap: isDebug,
              // CSS Modules https://github.com/css-modules/css-modules
              modules: true,
              localIdentName: isDebug
                ? '[name]-[local]-[hash:base64:5]'
                : '[hash:base64:5]',
              // CSS Nano http://cssnano.co/
              minimize: isDebug ? false : minimizeCssOptions,
            },
          },

          // Apply PostCSS plugins including autoprefixer
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: 'inline',
              config: {
                path: resolvePath('build/postcss.config.js'),
              },
            },
          },

          // Compile Less to CSS
          // https://github.com/webpack-contrib/less-loader
          // Install dependencies before uncommenting: yarn add --dev less-loader less
          // {
          //   test: /\.less$/,
          //   loader: 'less-loader',
          //   options: { sourceMap: true },
          // },

          // Compile Sass to CSS
          // https://github.com/webpack-contrib/sass-loader
          // Install dependencies before uncommenting: yarn add --dev sass-loader node-sass
          // {
          //   test: /\.(scss|sass)$/,
          //   loader: 'sass-loader',
          //   options: { sourceMap: true },
          // },
          
          // Compile Stylus to CSS
          // https://github.com/shama/stylus-loader
          // Install dependencies before uncommenting: yarn add --dev stylus-loader stylus
          {
            test: /\.styl$/,
            loader: 'stylus-loader',
            options: { sourceMap: true },
          },
        ],
      },

      // Rules for images
      {
        test: reImage,
        oneOf: [
          // Inline lightweight images into CSS
          {
            issuer: reStyle,
            oneOf: [
              // Inline lightweight SVGs as UTF-8 encoded DataUrl string
              {
                test: /\.svg$/,
                loader: 'svg-url-loader',
                options: {
                  name: staticAssetName,
                  limit: 4096, // 4kb
                },
              },

              // Inline lightweight images as Base64 encoded DataUrl string
              {
                loader: 'url-loader',
                options: {
                  name: staticAssetName,
                  limit: 4096, // 4kb
                },
              },
            ],
          },

          // Or return public URL to image resource
          {
            loader: 'file-loader',
            options: {
              name: staticAssetName,
            },
          },
        ],
      },

      // Return public URL for all assets unless explicitly excluded
      // DO NOT FORGET to update `exclude` list when you adding a new loader
      {
        exclude: [reScript, reStyle, reImage],
        loader: 'file-loader',
        options: {
          name: staticAssetName,
        },
      },

      // Exclude dev modules from production build
      ...(isDebug
        ? []
        : [
          {
            test: resolvePath(
              'node_modules/react-deep-force-update/lib/index.js',
            ),
            loader: 'null-loader',
          },
        ]),
    ]

  },

  // Don't attempt to continue if there are any errors.
  bail: !isDebug,

  cache: isDebug,

  // Specify what bundle information gets displayed
  // https://www.webpackjs.com/configuration/stats/
  stats: {
    cached: isVerbose,
    cachedAssets: isVerbose,
    chunks: isVerbose,
    chunkModules: isVerbose,
    colors: true,
    hash: isVerbose,
    modules: isVerbose,
    reasons: isDebug,
    timings: true,
    version: isVerbose,
  },

  // Choose a developer tool to enhance debugging
  // https://www.webpackjs.com/configuration/devtool/#devtool
  devtool: isDebug ? 'cheap-module-inline-source-map' : 'source-map',
}