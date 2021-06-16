import InvalidPageError from '@/errors/InvalidPageError';
import PostAdapter from '@/fanbox/modules/PostAdapter';
import config from '@/fanbox/config';

export default class Detector {

  static instance;

  static getDefault() {
    if (!Detector.instance) {
      Detector.instance = new Detector();
    }

    return Detector.instance;
  }

  isValidPage(url) {
    return config.post_url_pattern.test(url) || config.post_url_pattern2.test(url);
  }

  getPostAdapter(url) {
    if (this.isValidPage(url)) {
      let postAdapter = PostAdapter.getDefault();
      postAdapter.setUrl(url);

      /**
       * Highlight icon
       */
      browser.runtime.sendMessage({
        action: 'activeIcon'
      });

      return postAdapter;
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
