import { app } from '@/background/Application';
import HistoryBackupRepo from '@/repositories/HistoryBackup';
import IllustHistoryPort from './IllustHistoryPort';
import IllustHistoryRepo from '@/repositories/IllustHistory';

export default class BackgroundPort extends IllustHistoryPort {
  static instance;

  constructor() {
    super();

    this.illustHistoryRepo = new IllustHistoryRepo({ max: app().settings.maxHistoryItems });
    this.historyBackupRepo = HistoryBackupRepo.getDefault();
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
    this.historyBackupRepo.putBackup(args);
    return this.illustHistoryRepo.putIllust(args)
  }

  saveBatchHistoriesAction({ items }, port) {
    return this.illustHistoryRepo.putBatchHistories(items).then(() => {
      this.sendMessageThroughPort(port, 'save-batch-histories');
    }).catch(error => {
      this.sendMessageThroughPort(port, 'save-batch-histories', { error });
    });
  }

  countItemsAction(args, port) {
    this.illustHistoryRepo.countItems(args).then(count => {
      this.sendMessageThroughPort(port, 'items-count', { count });
    });
  }

  listItemsAction(args, port) {
    this.illustHistoryRepo.getIllusts(args).then(docs => {
      this.sendMessageThroughPort(port, 'items-list', { dataset: docs });
    }).catch(err => {
      this.sendMessageThroughPort(port, 'items-list', { error: err });
    });
  }

  searchItemsAction(args, port) {
    if (args.extra && args.extra.query.length > 0) {
      args.fun = (doc, emit) => {
        if (doc.title.toLowerCase().indexOf(args.extra.query) > -1) {
          emit(doc);
        }
      }
    }

    this.illustHistoryRepo.searchIllusts(args).then(docs => {
      this.sendMessageThroughPort(port, 'items-list', { dataset: docs });
    }).catch(err => {
      this.sendMessageThroughPort(port, 'items-list', { error: err });
    });
  }

  deleteIllustHistoryAction(args) {
    this.historyBackupRepo.forgetBackup(args);
    return this.illustHistoryRepo.deleteIllust(args);
  }

  clearHistoryAction() {
    this.illustHistoryRepo.clearData();
    this.historyBackupRepo.forgetAll();
  }
}
