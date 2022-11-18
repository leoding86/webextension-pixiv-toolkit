export default (...args) => {
  let parts = [];

  args.forEach(arg => {
    if (arg === '..' && parts.length > 0) {
      parts.pop();
    } else if (!!arg && arg !== '.') {
      parts.push(arg);
    }
  });

  if (parts.length === 0) {
    return '';
  } else {
    let path = parts.join('/').replace(/[\/\\]+/g, '/');

    if (path.indexOf('/') === 0) {
      return path.substr(1);
    } else {
      return path;
    }
  }
}
