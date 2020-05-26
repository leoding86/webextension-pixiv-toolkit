import HistoryBackupRepo from '@/repositories/HistoryBackup';
import IllustHistoryPort from './IllustHistoryPort';
import IllustHistoryRepo from '@/repositories/IllustHistory';

export default class BackgroundPort extends IllustHistoryPort {
  static instance;

  constructor() {
    super();

    this.illustHistoryRepo = new IllustHistoryRepo();
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
    this.historyBackupRepo.putBackup(args.id);
    return this.illustHistoryRepo.putIllust(args)
  }

  listIllustHistoriesAction() {
    return this.illustHistoryRepo.getIllusts();
  }

  deleteIllustHistoryAction(args) {
    this.historyBackupRepo.forgetBackup(args.id);
    return this.illustHistoryRepo.deleteIllust(args);
  }
}
