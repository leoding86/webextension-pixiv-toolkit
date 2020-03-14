import IllustHistoryRepo from '@/repositories/IllustHistory';
import IllustHistoryPort from './IllustHistoryPort';

export default class BackgroundPort extends IllustHistoryPort {
  static instance;

  constructor() {
    super();

    this.illustHistoryRepo = new IllustHistoryRepo();
  }

  static getInstance(port) {
    if (!BackgroundPort.instance) {
      BackgroundPort.instance = new BackgroundPort();
    }

    BackgroundPort.instance.port = port;
    BackgroundPort.instance.createListener();

    return BackgroundPort.instance;
  }

  saveIllustHistoryAction(args) {
    return this.illustHistoryRepo.putIllust(args)
  }

  listIllustHistoriesAction() {
    return this.illustHistoryRepo.getIllusts();
  }

  deleteIllustHistoryAction(args) {
    return this.illustHistoryRepo.deleteIllust(args);
  }
}
