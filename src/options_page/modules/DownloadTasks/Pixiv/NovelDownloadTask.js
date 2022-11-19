import AbstractDownloadTask from "../AbstractDownloadTask";
import Downloader from "@/modules/Net/Downloader";
import { app } from "@/options_page/DownloadsApplication";
import FileSystem from "../../FileSystem";
import NameFormatter from "@/modules/Util/NameFormatter";

/**
 * @typedef NovelDownloadTaskOptions
 * @property {string} id
 * @property {string} url
 * @property {string} renameRule
 * @property {'txt'|'epub'} bookType
 * @property {any} context
 *
 * @class
 */
class NovelDownloadTask extends AbstractDownloadTask {
  /**
   * @inheritdoc
   */
  type = 'PIXIV_NOVEL';

  /**
   * @type {NovelDownloadTaskOptions}
   */
  options;

  /**
   *
   * @param {NovelDownloadTaskOptions} options
   */
  constructor(options) {
    super();

    this.id = options.id;
    this.url = options.url;
    this.state = this.PENDING_STATE;
    this.title = options.context.title;
    this.context = options.context;
    this.options = options;
  }

  /**
   * Create a pixiv illustration download task
   * @param {NovelDownloadTaskOptions} options
   * @returns {NovelDownloadTask}
   */
  static create(options) {
    return new NovelDownloadTask(options);
  }

  async makeEpubBook() {
    let epubMaker = new EpubMaker();
    epubMaker.withTemplate('idpf-wasteland');
    epubMaker.withUuid(this.url);
    epubMaker.withAuthor(this.context.userName);
    epubMaker.withAttributionUrl(this.context.url);
    epubMaker.withCover(this.context.coverUrl);
    epubMaker.withTitle(this.title);

    if (this.options.includeDescription) {
      epubMaker.withSection(new EpubMaker.Section('bodymatter', null, {
        content: this.context.description
      }, false, false));
    }

    this.context.sections.forEach(section => {
      epubMaker.withSection(new EpubMaker.Section('bodymatter', null, {
        content: section
      }, false, false));
    });

    let blob = await epubMaker.downloadEpub();
    let url = URL.createObjectURL(blob);

    this.lastDownloadId = await FileSystem.getDefault().saveFile({
      url,
      filename: nameFormatter.format(
        app().settings.novelRenameFormat,
        this.context.id + '_' + this.context.title
      ) + '.epub'
    });

    this.dispatch('complete');

    URL.revokeObjectURL(saveUrl);
  }

  async makeTxtBook() {
    let contentParts = [];

    contentParts.push(this.url);
    contentParts.push(this.context.userName);
    contentParts.push(this.title);

    this.context.sections.forEach(section => {
      contentParts.push(section.replace(/<br\s*\/>/ig, "\r\n").trim());
    });

    let content = contentParts.join("\r\n".repeat(2));
    let url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    let nameFormatter = NameFormatter.getFormatter({ context: this.context });

    this.lastDownloadId = await FileSystem.getDefault().saveFile({
      url,
      filename: nameFormatter.format(
        this.options.renameRule,
        this.context.id + '_' + this.context.title
      ) + '.txt'
    });

    this.dispatch('complete');

    URL.revokeObjectURL(url);
  }

  /**
   * @override
   */
  async start() {
    this.state = this.DOWNLOADING_STATE;

    if (this.options.bookType === 'epub') {
      await this.makeEpubBook();
    } else if (this.options.bookType === 'txt') {
      await this.makeTxtBook();
    }

    this.progress = 1;
    this.state = this.COMPLETE_STATE;

    this.dispatch('start');
  }

  /**
   * @override
   */
  pause() {
    //
  }

  /**
   * @override
   */
  stop() {
    //
  }
}

export default NovelDownloadTask;
