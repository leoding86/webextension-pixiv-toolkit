import {
  FanboxPostAdapter,
  PixivComicEpisodeAdapter,
  PixivIllustAdapter, PixivNovelAdapter,
} from '@/content_scripts/modules/PageAdapters';
import AbstractAdapter from '@/content_scripts/modules/PageAdapters/AbstractAdapter';
import { RuntimeError } from '@/errors';

class Adapter {
  /**
   * @type {AbstractAdapter} Inner adapter
   */
  adapter

  /**
   * @type {{ type: string, adapter: AbstractAdapter }[]}
   */
  typeAdapterMaps = [
    {
      type: 'pixiv_illust',
      adapter: PixivIllustAdapter,
    },
    {
      type: 'pixiv_novel',
      adapter: PixivNovelAdapter,
    },
    {
      type: 'pixiv_comic_episode',
      adapter: PixivComicEpisodeAdapter,
    },
    {
      type: 'fanbox_post',
      adapter: FanboxPostAdapter,
    },
  ];

  /**
   * Abort parse context
   */
  abort() {
    if (this.adapter) {
      try {
        this.adapter.abort();
        this.adapter = null;
      } catch (error) {
        console.error(error)
      }
    }
  }

  /**
   *
   * @param {string} type
   * @param {string} url
   */
  async getResource(type, url) {
    this.abort();

    for (let map of this.typeAdapterMaps) {
      if (map.type === type) {
        if (map.adapter) {
          let context = { type, url };
          this.adapter = map.adapter.getAdapter(Object.assign({}, context));
          return await this.adapter.getResource();
        } else {
          throw new RuntimeError(`Can't get resource ${url}`);
        }
      }
    }
  }
}

export default Adapter;
