export default (() => {
  if (self) {
    return self.chrome || chrome || browser;
  } else {
    return window.chrome || chrome || browser;
  }
})();
