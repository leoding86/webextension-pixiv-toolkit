import { RuntimeError } from "@/errors";
import Download from "@/modules/Net/Download";
import {
  FanboxPostAdapter,
  PixivComicEpisodeAdapter,
  PixivIllustAdapter,
  PixivNovelAdapter,
 } from "./DownloadAdapters";

class DownloadAdapter {
  /**
   * The map keys MUST the match the keys in config/urlFilters.
   */
  static adapterMap = {
    'pixiv_illust': PixivIllustAdapter,
    'pixiv_novel': PixivNovelAdapter,
    'pixiv_comic_episode': PixivComicEpisodeAdapter,
    'fanbox_post': FanboxPostAdapter,
  };

  type;

  url;

  constructor(type, url) {
    if (!DownloadAdapter.adapterMap[type]) {
      throw new RuntimeError(`Invalid download adapter ${type}`);
    }

    this.type = type;
    this.url = url;
  }

  static create(type, url) {
    return new DownloadAdapter(type, url);
  }

  async createDownloadTask(options) {
    let adpater = DownloadAdapter.adapterMap[this.type].create(this.url);
    return await adpater.createDownloadTask(options);
  }
}

export default DownloadAdapter;
