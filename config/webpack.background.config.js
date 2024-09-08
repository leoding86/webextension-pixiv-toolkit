'use strict'

const packageInfo = require('../package.json');
const baseConfig = require('./webpack.base.config')();
const utils = require('./utils');
const { merge } = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = env => {
  let platform = env ? (env.platform || 'chrome') : 'chrome';
  let isProduction = process.env.NODE_ENV === 'production';

  console.log(`current target platform: ${platform}`);

  return merge(baseConfig, {
    entry: {
      // background: './src/background/main.js'
      background: './src/background/Bootstrap.js'
    },
    output: {
      path: utils.resolve(`dist/${platform}/background`),
      filename: '[name].js'
    },
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: isProduction && (env && env.analyzer) ? 'static' : 'disabled',
        reportFilename: '../bundleAnalyzer/background.html'
      }),

      new CopyPlugin({
        patterns: [
          {
            from: utils.resolve('src/statics'),
            to: utils.resolve(`dist/${platform}/`),
            globOptions: {
              ignore: [
                '**/manifest.json',
                '**/remote/**/*'
              ]
            }
          }, {
            from: utils.resolve('node_modules/vue/dist/vue.min.js'),
            to: utils.resolve(`dist/${platform}/lib/vue.min.js`)
          }, {
            from: utils.resolve('node_modules/vue-i18n/dist/vue-i18n.min.js'),
            to: utils.resolve(`dist/${platform}/lib/vue-i18n.min.js`)
          }, {
            from: utils.resolve('node_modules/pouchdb/dist/pouchdb.min.js'),
            to: utils.resolve(`dist/${platform}/lib/pouchdb.min.js`)
          }, {
            from: utils.resolve('node_modules/pouchdb/dist/pouchdb.find.min.js'),
            to: utils.resolve(`dist/${platform}/lib/pouchdb.find.min.js`)
          }, {
            from: utils.resolve('node_modules/@ffmpeg/core/dist'),
            to: utils.resolve(`dist/${platform}/lib/ffmpeg`)
          }, {
            from: utils.resolve('src/statics/manifest.json'),
            to: utils.resolve(`dist/${platform}/manifest.json`),
            transform(content, path) {
              let json = JSON.parse(content.toString());

              json.version_name = json.version = packageInfo.version;

              /**
               * About manifest file, there are some differences between FireFox and browsers which based Chromium.
               * So we need do some extra works to make the target browser manifest file.
               */
              if (json.options_page && platform === 'firefox') {
                console.log(`rename options_page to options_ui`);

                json.options_ui = {};
                json.options_ui.page = json.options_page;
                json.options_ui.open_in_tab = true;

                json.optional_permissions && json.optional_permissions.forEach(permission => {
                  if (permission === 'downloads.shelf') {
                    return;
                  }

                  json.permissions.push(permission);
                });

                delete json.optional_permissions;
                delete json.options_page;

                console.log(`remove version_name property from manifest`);
                delete json.version_name;
              }

              return JSON.stringify(json);
            }
          }
        ]
      })
    ],
    externals: {
      browser: 'browser',
      chrome: 'chrome',
      FFmpeg: 'FFmpeg'
    }
  });
};
