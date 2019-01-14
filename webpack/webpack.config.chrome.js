const merge = require('webpack-merge');
const common = require('./webpack.config.common.js');

/**
 * DEVELOPMENT ONLY
 * This is the webpack configuration settings development only
 * If you have a configuration that will be shared by all webpack process
 * please add thos configurations to the file:
 * webpack.common.js
 */

module.exports = merge(common, {
  mode: 'development',
});
