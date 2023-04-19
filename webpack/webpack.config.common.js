require('dotenv');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const sharedDir = path.join(__dirname, '../src/shared');
const chromeDir = path.join(__dirname, '../src/chrome');
const distDir = path.join(__dirname, '../dist/chrome');

/**
 * This is the common configuration settings for all webpack processes
 * If you have a configuration that is browser specific place it
 * in one of the following files:
 * webpack.config.chrome
 * webpack.config.safari **Coming Soon**
 * webpack.config.firefox **Coming Soon**
 *
 * If you need to add new files for input please ad them to:
 * webpack.entries.js
 */
module.exports = {
  devtool: 'cheap-module-source-map',
  // This will split the code into seperate files
  // https://webpack.js.org/plugins/split-chunks-plugin/
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '-',
      name: true,
      cacheGroups: {
        // This will take any imports from your JS files
        // And if they are located in node_modules, it will
        // added them to a vendor js file.
        // https://webpack.js.org/plugins/split-chunks-plugin/#splitchunks-cachegroups
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  },
  // User Modern JS and transpile
  module: {
    rules: [
      {
        test: /\.m?js$/,
        // exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  // This is where you specify the files that will be the input
  // https://webpack.js.org/configuration/entry-context/
  entry: {
    popup: `${sharedDir}/js/popup.js`,
    service_worker: `${sharedDir}/js/service_worker.js`,
    content: `${sharedDir}/js/content.js`,
    oauth_redirect: `${sharedDir}/js/oauth_redirect.js`
  },
  // This specifys where you want the files to be out put to
  // and the name of the source maps, if your environment outputs them.
  // https://webpack.js.org/configuration/output/
  output: {
    filename: 'js/[name].js',
    path: distDir,
    sourceMapFilename: 'js/[name].js.map'
  },
  // Tell webpack what directories should be searched when resolving modules.
  // https://webpack.js.org/configuration/resolve/#resolve-modules
  resolve: {
    modules: ['node_modules']
  },
  // https://webpack.js.org/plugins/
  plugins: [
    // Use modules without having to use import/require
    // https://webpack.js.org/plugins/provide-plugin
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    // This plugin will copy all files
    // to the dist directoy
    new CopyWebpackPlugin([
      {
        from: `${sharedDir}/html`,
        to: `${distDir}/html`
      },
      {
        from: `${sharedDir}/css`,
        to: `${distDir}/css`
      },
      {
        from: `${sharedDir}/img`,
        to: `${distDir}/img`
      },
      {
        from: `${chromeDir}/manifest.json`,
        to: `${distDir}/manifest.json`
      }
    ])
  ]
};
