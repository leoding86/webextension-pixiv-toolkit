function RetryTicker(max) {
  this.maxTry = max;
  this.tryTimes = 0;
}

RetryTicker.prototype = {
  reset: function () {
      this.retryTimes = 0;
  },

  reachLimit: function () {
      if (this.tryTimes < this.maxTry) {
          this.tryTimes++;
          return false;
      }

      return true;
  },
};

export default RetryTicker;
