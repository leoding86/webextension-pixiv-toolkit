import IllustHistoryPort from './IllustHistoryPort';

export default class RendererPort extends IllustHistoryPort {
  static instance;

  constructor() {
    super();

    this.createPort(IllustHistoryPort.portName);
  }

  static getInstance() {
    if (RendererPort.instance) {
      return RendererPort.instance;
    }

    return RendererPort.instance = new RendererPort();
  }

  postMessage(args) {
    try {
      this.port.postMessage(args)
    } catch (e) {
      // console.log(e)
    }
  }

  saveIllustHistory(args) {
    this.postMessage({
      action: 'saveIllustHistory',
      args: args
    });
  }

  countItems(args) {
    this.postMessage({
      action: 'countItems',
      args: args
    });
  }

  listItems(args) {
    this.postMessage({
      action: 'listItems',
      args: args
    });
  }

  searchItems(args) {
    this.postMessage({
      action: 'searchItems',
      args: args
    });
  }

  deleteIllustHistory(args) {
    return this.postMessage({
      action: 'deleteIllustHistory',
      args: args
    });
  }
}
