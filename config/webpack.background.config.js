'use strict'

const baseConfig = require('./webpack.base.config');
const utils = require('./utils');
const CopyPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');

const config = merge.smart(baseConfig, {
  entry: {
    background: './src/background/main.js'
  },
  output: {
    path: utils.resolve('dist/backgrounds'),
    filename: '[name].js'
  },
  plugins: [
    new CopyPlugin([{
      from: utils.resolve('src/statics'),
      to: utils.resolve('dist')
    }])
  ]
});

module.exports = config;
