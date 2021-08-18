export default (...args) => {
  let path = args.join('/');

  return path.replace(/[\/\\]+/g, '/');
}
