'use strict'

const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base.config')();
const utils = require('./utils');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isProduction = process.env.NODE_ENV === 'production' ?
  !0 : !!0;

module.exports = env => {
  let platform = env ? (env.platform || 'chrome') : 'chrome';

  return Object.assign({}, baseConfig, {
    entry: {
      locales: utils.resolve('src/modules/Locales.js'),
    },
    output: {
      library: '[name]',
      path: utils.resolve(`dist/${platform}/lib`),
      filename: '[name].js',
      libraryTarget: 'umd'
    },
    module: merge({
      rules: [
        {
          test: /\.json$/,
          type: "javascript/auto",
          loader: 'json-loader'
        }
      ]
    }),
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: isProduction && (env && env.analyzer) ? 'static' : 'disabled',
        reportFilename: '../bundleAnalyzer/common.html'
      }),
    ]
  });
};
