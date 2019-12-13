'use strict'

const baseConfig = require('./webpack.base.config')();
const utils = require('./utils');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isProduction = process.env.NODE_ENV === 'production' ?
  !0 : !!0;

module.exports = env => {
  let platform = env ? (env.platform || 'chrome') : 'chrome';

  let baseConfig_ = Object.assign({}, baseConfig);

  delete baseConfig_.externals.pouchdb;
  delete baseConfig_.externals["pouchdb-find"];

  return Object.assign({}, baseConfig_, {
    entry: {
      pouchdb: './src/common/PouchDB.js'
    },
    output: {
      library: 'common',
      path: utils.resolve(`dist/${platform}/lib`),
      filename: '[name].js'
    },
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: isProduction ? 'static' : 'disabled',
        reportFilename: '../bundleAnalyzer/common.html'
      }),
    ]
  });
};
