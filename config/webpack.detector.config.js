'use strict'

const baseConfig = require('./webpack.base.config');
const utils = require('./utils');

const config = Object.assign({}, baseConfig, {
  entry: {
    detector: './src/content_scripts/detector.js'
  },
  output: {
    path: utils.resolve('dist/content_scripts'),
    filename: '[name].js'
  },
  externals: {
    common: 'common'
  }
});

module.exports = config;
