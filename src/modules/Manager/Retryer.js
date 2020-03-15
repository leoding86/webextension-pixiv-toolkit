import Event from '@/modules/Event';
import RetryTicker from '@/modules/Util/RetryTicker';

class Retryer extends Event {
  constructor({ maxTime = 3 }) {
    super();

    this.retryTicker = new RetryTicker(maxTime);
    this.process = null;
  }

  getRetryTime() {
    return this.retryTicker.tryTimes;
  }

  runProcess() {
    let processReturn = this.process(this);

    if (processReturn instanceof Promise) {
      return new Promise((resolve, reject) => {
        processReturn.then(result => {
          return resolve(result);
        }).catch(error => {
          if (this.retryTicker.reachLimit()) {
            return reject(error);
          } else {
            this.dispatch('onretry', [error]);

            return resolve(this.retry());
          }
        });
      });
    }
  }

  retry() {
    return this.runProcess();
  }

  start(process) {
    this.process = process;

    return this.runProcess();
  }
}

export default Retryer;
