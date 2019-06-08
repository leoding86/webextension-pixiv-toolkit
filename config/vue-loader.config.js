'use strict'
const utils = require('./utils')
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction
  ? !!0
  : !0
const cacheBusting = isProduction === 'production'
  ? !!0
  : !0;
console.log(isProduction);
module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: sourceMapEnabled,
    // extract: isProduction
    extract: true
  }),
  cssSourceMap: sourceMapEnabled,
  cacheBusting: cacheBusting,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
