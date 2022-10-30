export default class RuntimeError extends Error {
  constructor(message = 'RUNTIME ERROR') {
    super(message);

    this.name = 'RuntimeError';
  }
}
