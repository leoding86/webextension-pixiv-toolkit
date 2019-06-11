function ScheduledTask () {
  this.intervalTime,
  this.taskTimeout,
  this.task,
  this.status = ScheduledTask.IDLE;

  this.run = function () {
    var self = this;

    if (typeof this.task.handle === 'function' &&
      (this.status === ScheduledTask.WAITING || this.status === ScheduledTask.IDLE) &&
      this.intervalTime > 1000
    ) {
      this.task.handle.call(this.task).then(function () {
        self.status = ScheduledTask.COMPLETE;

        self.scheduleNext();
      }).catch(function () {
        self.status = ScheduledTask.FAILURE;

        self.scheduleNext();
      });
    }
  }

  this.scheduleNext = function () {
    var self = this;

    this.taskTimeout = setTimeout(function () {
      self.run();
    }, this.intervalTime);

    this.status = ScheduledTask.WAITING;
  }

  this.stop = function () {
    if (this.taskTimeout) {
      clearTimeout(this.taskTimeout);
    }
  }
}

ScheduledTask.IDLE = 0;

ScheduledTask.WAITING = 1;

ScheduledTask.COMPLETE = 2;

ScheduledTask.FAILURE = 3;

module.exports = ScheduledTask;
