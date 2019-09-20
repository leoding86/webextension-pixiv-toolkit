'use strict'

const baseConfig = require('./webpack.base.config');
const utils = require('./utils');
const CopyPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');

module.exports = env => {
  let platform = env ? (env.platform || 'chrome') : 'chrome';

  console.log(`current target platform: ${platform}`);

  return merge.smart(baseConfig, {
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
        to: utils.resolve('dist'),
        ignore: [
          utils.resolve('src/static/manifest.json')
        ]
      }, {
        from: utils.resolve('src/statics/manifest.json'),
        to: utils.resolve('dist/manifest.json'),
        transform(content, path) {
          let json = JSON.parse(content.toString());

          if (json.options_page && platform === 'firefox') {
            console.log(`rename options_page to options_ui`);

            json.options_ui = {};
            json.options_ui.page = json.options_page;
            delete json.options_page;
          }

          return JSON.stringify(json);
        }
      }]),
    ]
  });
};
