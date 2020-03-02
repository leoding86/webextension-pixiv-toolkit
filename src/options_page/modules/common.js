let common = {
  isBrowser (browser) {
    if (browser === 'edge') {
      browser = 'edg';
    }

    var regex = new RegExp(browser, 'i');

    return regex.test(navigator.userAgent);
  }
};

export default common;
