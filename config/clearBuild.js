const fs = require('fs-extra');

// clean dist
module.exports = env => {
    let platform = env ? (env.platform || 'chrome') : 'chrome';
    fs.emptyDirSync(`./dist/${platform}`)
  }