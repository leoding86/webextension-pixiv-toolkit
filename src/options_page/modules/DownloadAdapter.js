import { RuntimeError } from "@/errors";
import Download from "@/modules/Net/Download";
import { IllustAdapter, NovelAdapter } from "./DownloadAdapters";

class DownloadAdapter {
  static adapterMap = {
    'pixiv_illust': IllustAdapter,
    'pixiv_novel': NovelAdapter,
    'pixiv_comic_episode': '',
    'fanbox_post': '',
  };

  type;

  url;

  constructor(type, url) {
    this.type = type;
    this.url = url;

    if (!DownloadAdapter.adapterMap[this.type]) {
      throw new RuntimeError(`Invalid download adapter ${this.type}`);
    }
  }

  static create(type, url) {
    return new DownloadAdapter(type, url);
  }

  async createDownloadTask(options) {
    if (!DownloadAdapter.adapterMap[this.type]) {
      throw new RuntimeError(`Invalid type ${this.type}`);
    }

    let adpater = DownloadAdapter.adapterMap[this.type].create(this.url);
    return await adpater.createDownloadTask(options);
  }
}

export default DownloadAdapter;
