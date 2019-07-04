function Queue() {
  this.stack = [];
  this.index = 0;
  this.complete = 0;
  this.fail = 0;
  this.total = 0;
  this.onItemComplete;
  this.onItemFail;
  this.stopQueue = false;
};

Queue.prototype = {
  add: function (item) {
      this.stack.push(item);
      this.total = this.stack.length;
  },

  next: function () {
      if (this.index < this.stack.length) {
          this.index++;
      }
  },

  current: function () {
      return this.stack[this.index];
  },

  start: function (callback, done) {
      let _this = this,
          item;

      if (item = this.current()) {
          callback(item).then(function () {
              _this.complete++;
              if (_this.onItemComplete) {
                  _this.onItemComplete.call(_this);
              }
          }).catch(function () {
              _this.fail++;
              if (_this.onItemFail) {
                  _this.onItemFail.call(_this, this.index);
              }
          }).finally(function () {
              if (_this.stopQueue) {
                  return;
              }

              _this.next();
              _this.start(callback, done);
          });
      } else {
          if (_this.onDone) {
              _this.onDone.call(_this);
          }
      }
  },

  abort: function () {
      this.stopQueue = !0;
  }
};

export default Queue;
