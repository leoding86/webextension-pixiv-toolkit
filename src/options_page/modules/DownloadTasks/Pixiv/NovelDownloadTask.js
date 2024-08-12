import AbstractDownloadTask from "../AbstractDownloadTask";
import GlobalSettings from "@/modules/GlobalSettings";
import FileSystem from "../../FileSystem";
import NameFormatter from "@/modules/Util/NameFormatter";
import pathjoin from "@/modules/Util/pathjoin";

/**
 * @typedef NovelDownloadTaskOptions
 * @property {string} id
 * @property {string} url
 * @property {string} renameRule
 * @property {boolean} includeDescription
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

    this.lastDownloadId = await FileSystem.getDefault().saveFileInBackground({
      url,
      filename: pathjoin(GlobalSettings().downloadRelativeLocationnameFormatter.format(
        GlobalSettings().novelRenameFormat,
        this.context.id + '_' + this.context.title
      )) + '.epub'
    });

    this.changeState(this.COMPLETE_STATE);
    this.dispatch('complete');

    URL.revokeObjectURL(saveUrl);
  }

  async makeTxtBook() {
    let contentParts = [];

    contentParts.push(this.url);
    contentParts.push(this.context.userName);
    contentParts.push(this.title);

    if (this.options.includeDescription) {
      contentParts.push(this.context.description.replace(/<br\s*\/>/ig, "\r\n").trim());
    }

    this.context.sections.forEach(section => {
      contentParts.push(section.replace(/<br\s*\/>/ig, "\r\n").trim());
    });

    let content = contentParts.join("\r\n".repeat(2));
    let url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    let nameFormatter = NameFormatter.getFormatter({ context: this.context });

    this.lastDownloadId = await FileSystem.getDefault().saveFileInBackground({
      url,
      filename: pathjoin(GlobalSettings().downloadRelativeLocation, nameFormatter.format(
        this.options.renameRule,
        this.context.id + '_' + this.context.title
      )) + '.txt'
    });

    this.changeState(this.COMPLETE_STATE);
    this.dispatch('complete');

    URL.revokeObjectURL(url);
  }

  /**
   * @override
   */
  async start() {
    if (this.options.bookType === 'epub') {
      await this.makeEpubBook();
    } else {
      await this.makeTxtBook();
    }

    this.progress = 1;

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
