'use strict'

const baseConfig = require('./webpack.base.config');
const utils = require('./utils');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const vueLoaderConfig = require('./vue-loader.config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production' ?
  !0 : !!0;

module.exports = env => {
  let platform = env ? (env.platform || 'chrome') : 'chrome';

  return merge.smart(baseConfig, {
    entry: {
      app: './src/popup_page/main.js'
    },
    output: {
      path: utils.resolve(`dist/${platform}/popup_page`),
      filename: '[name].js',
      publicPath: './'
    },
    module: merge.smart({
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: vueLoaderConfig
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('img/[name].[hash:7].[ext]')
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
      // extract css into its own file
      new ExtractTextPlugin({
        filename: utils.assetsPath('css/[name].css'),
        // Setting the following option to `false` will not extract CSS from codesplit chunks.
        // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
        // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
        // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
        allChunks: true,
      }),

      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      // new OptimizeCSSPlugin({
      //   cssProcessorOptions: process.env.NODE_ENV !== 'production'
      //     ? { safe: true, map: { inline: false } }
      //     : { safe: true }
      // }),

      // generate dist index.html with correct asset hash for caching.
      // you can customize output by editing /index.html
      // see https://github.com/ampedandwired/html-webpack-plugin
      new HtmlWebpackPlugin({
        filename: utils.resolve(`dist/${platform}/popup_page/index.html`),
        template: utils.resolve('src/options_page/index.html'),
        inject: true,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
          // more options:
          // https://github.com/kangax/html-minifier#options-quick-reference
        },
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'dependency'
      }),
    ],
    externals: {
      common: 'common',
      browser: 'browser',
      chrome: 'chrome'
    }
  });
};
