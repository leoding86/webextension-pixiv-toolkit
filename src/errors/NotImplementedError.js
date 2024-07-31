import RuntimeError from "./RuntimeError";

export default class NotImplementedError extends RuntimeError {
  constructor(message = 'Not implemented') {
    super(message);

    this.name = 'NotImplementedError';
  }
}
