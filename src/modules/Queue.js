function Queue() {
  this.stack = [];
  this.complete = 0;
  this.fail = 0;
  this.total = 0;
  this.queuing = false;
  this.onItemComplete;
  this.onItemFail;
  this.onDone;
  this.pauseQueue = false;
  this.processors = 1;
  this.active = 0;
};

Queue.prototype = {
  setProcessors(processors) {
    this.processors = parseInt(processors);
  },

  add: function (item) {
    this.stack.push({
      item,
      failure: false,
    });
    this.total = this.stack.length;
  },

  renewFailureItems() {
    for (let i in this.stack) {
      this.stack[i].failure = false;
    }

    this.fail = 0;
  },

  current: function () {
    if (this.stack[0] && !this.stack[0].failure) {
      return this.stack.shift();
    }
  },

  start: function (handle) {
    if (this.queuing) {
      return;
    }

    if (this.fail > 0) {
      this.renewFailureItems();
    }

    this.queuing = true;

    this.queue(handle);
  },

  queue: function(handle) {
    if (this.active >= this.processors) {
      return;
    }

    let item;

    if (item = this.current()) {
      this.active++;

      handle(item.item).then(() => {
        this.complete++;

        if (this.onItemComplete) {
          this.onItemComplete.call(this);
        }
      }).catch(() => {
        this.fail++;

        item.failure = true;
        this.stack.push(item);

        if (this.onItemFail) {
          this.onItemFail.call(this, item.item);
        }
      }).finally(() => {
        this.active--;

        if (this.pauseQueue) {
          /**
           * If there is a pause signal, don't contiune and mark queuing to false
           */
          if (this.onPaused) {
            this.queuing = false;
            this.onPaused.call(this);
          }
          return;
        }

        if (this.stack.filter(item => item.failure === false).length === 0) {
          typeof this.onDone === 'function' && this.onDone.call(this);
        }

        /**
         * Run next item
         */
        this.queue(handle);
      });

      /**
       * Run next item if the active item isn't reach processors limit
       */
      if (this.active < this.processors) {
        this.queue(handle);
      }
    }
  },

  pause: function () {
    this.pauseQueue = true;
  },

  cancelPause: function () {
    this.pauseQueue = false;
  }
};

export default Queue;
