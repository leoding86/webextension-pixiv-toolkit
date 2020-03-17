function Queue() {
  this.stack = [];
  this.index = 0;
  this.complete = 0;
  this.fail = 0;
  this.total = 0;
  this.onItemComplete;
  this.onItemFail;
  this.stopQueue = false;
  this.processors = 1;
  this.active = 0;
};

Queue.prototype = {
  setProcessors(processors) {
    this.processors = parseInt(processors);
  },

  add: function (item) {
    this.stack.push(item);
    this.total = this.stack.length;
  },

  next: function () {
    if (this.index < this.stack.length) {
      this.index++;
      return this.current();
    } else {
      return false;
    }
  },

  current: function () {
    return this.stack[this.index];
  },

  start: function (handle) {
    if (this.active >= this.processors) {
      return;
    }

    let index = this.index;
    let item;

    if (item = this.current()) {
      handle(item).then(() => {
        this.complete++;
        if (this.onItemComplete) {
          this.onItemComplete.call(this);
        }
      }).catch(() => {
        this.fail++;
        if (this.onItemFail) {
          this.onItemFail.call(this, index);
        }
      }).finally(() => {
        this.active--;

        if (this.stopQueue) {
          return;
        }

        if (this.next() !== false) {
          this.start(handle);
        } else if (this.total === (this.complete + this.fail)) {
          typeof this.onDone === 'function' && this.onDone.call(this);
        }
      });
    }

    if (this.next() !== false) {
      this.start(handle);
    }
  },

  abort: function () {
    this.stopQueue = !0;
  }
};

export default Queue;
