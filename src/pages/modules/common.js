let common = {
  isBrowser (browser) {
    var regex = new RegExp(browser, 'i');

    return regex.test(navigator.userAgent);
  }
};

export default common;
