'use strict'

const baseConfig = require('./webpack.base.config');
const utils = require('./utils');

module.exports = env => {
  let platform = env ? (env.platform || 'chrome') : 'chrome';

  return Object.assign({}, baseConfig, {
    entry: {
      common: './src/content_scripts/common.js'
    },
    output: {
      library: 'common',
      path: utils.resolve(`dist/${platform}/content_scripts`),
      filename: '[name].js'
    }
  });
};
