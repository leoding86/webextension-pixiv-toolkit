'use strict'

const backgroundConfig = require('./config/webpack.background.config');
const contentScriptsConfig = require('./config/webpack.content-scripts.config');
const optionsPageConfig = require('./config/webpack.options-page.config');
const popupConfig = require('./config/webpack.popup.config');

require('./config/clearBuild')();

module.exports = [
  backgroundConfig,
  contentScriptsConfig,
  optionsPageConfig,
  popupConfig
]
