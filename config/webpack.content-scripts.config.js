'use strict'

const baseConfig = require('./webpack.base.config')();
const utils = require('./utils');
const { merge } = require('webpack-merge');
const vueLoaderConfig = require('./vue-loader.config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const isProduction = process.env.NODE_ENV === 'production' ?
  !0 : !!0;

module.exports = env => {
  let platform = env ? (env.platform || 'chrome') : 'chrome';

  return merge(baseConfig, {
    entry: {
      app: './src/content_scripts/main.js',
    },
    output: {
      path: utils.resolve(`dist/${platform}/content_scripts`),
      filename: '[name].js',
      publicPath: './'
    },
    module: merge({
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: vueLoaderConfig
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: utils.assetsPath('img/[name].[hash:7].[ext]'),
              esModule: false // Fix bug about it will produce [object Module]
            }
          }
        },
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('media/[name].[hash:7].[ext]')
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
          }
        }
      ]
    }, {
      rules: utils.styleLoaders({
        sourceMap: !isProduction,
        extract: true,
        usePostCSS: true
      })
    }),
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: isProduction && (env && env.analyzer) ? 'static' : 'disabled',
        reportFilename: '../bundleAnalyzer/content-script.html'
      }),

      // extract css into its own file
      new MiniCssExtractPlugin({
        filename: utils.assetsPath('css/[name].css'),
      }),

      new VueLoaderPlugin()
    ],
    externals: {
      EpubMaker: 'EpubMaker',
      browser: 'browser'
    }
  });
}
