const utils = require('./utils');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = env => {
  let config = Object.assign({}, {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    output: {
      filename: '[name].js',
    },
    resolve: {
      extensions: ['.js', '.json', '.vue'],
      alias: {
        '@': utils.resolve('src'),
        '@@': utils.resolve('src/options_page')
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [utils.resolve('src')]
        }, {
          test: /\.worker\.js$/,
          loader: 'worker-loader',
          options: {
            inline: "no-fallback"
          }
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        PRESET_BROWSER: JSON.stringify(process.env.PLATFORM_ENV)
      })
    ],
    externals: {
      vue: 'Vue',
      'vue-i18n': 'VueI18n',
      pouchdb: 'PouchDB',
      'pouchdb-find': 'PouchDBFind',
      locales: 'locales',
    },
    node: {
      // prevent webpack from injecting useless setImmediate polyfill because Vue
      // source contains it (although only uses it if it's native).
      setImmediate: false,
      // prevent webpack from injecting mocks to Node native modules
      // that does not make sense for the client
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
      // prevent webpack from injecting eval / new Function through global polyfill
      global: false
    }
  });

  let _config;

  if (process.env.NODE_ENV === 'production') {
    _config = Object.assign({}, config);
  } else {
    _config = Object.assign({}, config, {
      devtool: 'inline-source-map'
    });
  }

  return _config;
}
