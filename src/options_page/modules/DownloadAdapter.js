import { RuntimeError } from "@/errors";
import {
  FanboxPostAdapter,
  PixivComicEpisodeAdapter,
  PixivIllustAdapter,
  PixivNovelAdapter,
 } from "./DownloadAdapters";
import {
  FanboxPostResource,
  PixivComicEpisdoeResource,
  PixivIllustResource,
  PixivNovelResource,
} from '@/modules/PageResource/index';
import AbstractAdapter from "@/content_scripts/modules/PageAdapters/AbstractAdapter";
import AbstractDownloadTask from "./DownloadTasks/AbstractDownloadTask";
import AbstractResource from "@/modules/PageResource/AbstractResource";

class DownloadAdapter {
  /**
   * @type {DownloadAdapter}
   */
  static default;

  /**
   * @type {Map.<AbstractResource, AbstractAdapter}
   */
  adapterMaps = new Map();

  constructor() {
    this.adapterMaps.set(FanboxPostResource, FanboxPostAdapter);
    this.adapterMaps.set(PixivComicEpisdoeResource, PixivComicEpisodeAdapter);
    this.adapterMaps.set(PixivIllustResource, PixivIllustAdapter);
    this.adapterMaps.set(PixivNovelResource, PixivNovelAdapter);
  }

  /**
   *
   * @returns {DownloadAdapter}
   */
  static create() {
    return new DownloadAdapter();
  }

  /**
   *
   * @returns {DownloadAdapter}
   */
  static default() {
    if (!DownloadAdapter.default) {
      DownloadAdapter.default = DownloadAdapter.create();
    }

    return DownloadAdapter.default;
  }

  /**
   *
   * @param {AbstractResource} resource
   * @param {any} options
   * @returns {AbstractDownloadTask}
   */
  async createDownloadTask(resource, options) {
    let adapter = this.adapterMaps.get(resource.constructor);

    if (!adapter) {
      throw new RuntimeError(`Cannot find download adapter with resource [${resource.constructor.name}].`);
    }

    let adpater = adapter.create(resource.getUrl());
    return await adpater.createDownloadTask(resource, options);
  }
}

export default DownloadAdapter;
