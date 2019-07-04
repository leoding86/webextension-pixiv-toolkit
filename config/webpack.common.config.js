'use strict'

const baseConfig = require('./webpack.base.config');
const utils = require('./utils');

const config = Object.assign({}, baseConfig, {
  entry: {
    common: './src/content_scripts/common.js'
  },
  output: {
    library: 'common',
    path: utils.resolve('dist/content_scripts'),
    filename: '[name].js'
  }
});

module.exports = config;
