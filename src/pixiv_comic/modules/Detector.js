import InvalidPageError from '@/errors/InvalidPageError';
import EpisodeAdapter from '@/pixiv_comic/modules/EpisodeAdapter';
import config from '@/pixiv_comic/config';

export default class Detector {

  static instance;

  static getDefault() {
    if (!Detector.instance) {
      Detector.instance = new Detector();
    }

    return Detector.instance;
  }

  isValidPage(url) {
    for (let pattern of config.episode_url_patterns) {
      if (pattern.test(url)) {
        return true;
      }
    }

    return false;
  }

  getEpisodeAdapter(url) {
    if (this.isValidPage(url)) {
      let episodeAdapter = EpisodeAdapter.getDefault();
      episodeAdapter.setUrl(url);

      /**
       * Highlight icon
       */
      browser.runtime.sendMessage({
        action: 'activeIcon'
      });

      return episodeAdapter;
    } else {
      /**
       * Deactive badge icon
       */
      browser.runtime.sendMessage({
        action: 'deactiveIcon'
      });

      throw new InvalidPageError(url);
    }
  }
}
