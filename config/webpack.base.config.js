const utils = require('./utils');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = env => {
  let platform = env ? (env.platform || 'chrome') : 'chrome';

  let config = Object.assign({}, {
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
            fallback: false,
            inline: true
          }
        }
      ]
    },
    externals: {
      vue: 'Vue',
      pouchdb: 'PouchDB',
      'pouchdb-find': 'PouchDBFind'
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
    _config = Object.assign({}, config, {
      plugins: [
        new UglifyJsPlugin({
          uglifyOptions: {
            output: {
              ascii_only: true
            },
            compress: {
              drop_console: true,
            }
          }
        })
      ]
    });
  } else {
    _config = Object.assign({}, config, {
      devtool: 'inline-source-map'
    });
  }

  return _config;
}
