import DateFormatter from '@/modules/Util/DateFormatter';
import Request from '@/modules/Net/Request';
import UnsupportedPostType from '@/errors/UnsupportedPostType';
import moment from 'moment';
import md5 from 'md5';
import config from '@/pixiv_comic/config';

class EpisodeAdapter {

  static instance;

  static ARTICLE_TYPE = 'article';

  static IMAGE_TYPE = 'image';

  constructor() {
    this.init();

    /**
     * @type {Request}
     */
    this.request = null;
  }

  static getDefault() {
    if (!EpisodeAdapter.instance) {
      EpisodeAdapter.instance = new EpisodeAdapter();
    }

    return EpisodeAdapter.instance;
  }

  init() {
    this.url = null;
    this.id = null;
    this.context = {
      id: '',
      title: '',
      subTitle: '',
      numberingTitle: '',
      workId: '',
      workTitle: '',
      images: [],
    };
  }

  setUrl(url) {
    if (this.request) {
      this.request.abort();
    }

    this.init();

    this.url = url;

    let matches = null;

    for (let pattern of config.episode_url_patterns) {
      matches = this.url.match(pattern);

      if (matches) {
        break;
      }
    }

    this.id = this.context.id = matches[1];
  }

  getUrl() {
    return config.episode_url.replace('{episode_id}', this.id);
  }

  getContext() {
    return new Promise((resolve, reject) => {
      let clientTime = moment().format('YYYY-MM-DDTHH:mm:ssZ');
      let clientHash = md5(clientTime.concat(config.episode_yek));

      this.request = new Request(this.getUrl(), {
        method: 'GET',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'x-client-hash': clientHash,
          'x-client-time': clientTime,
          'x-requested-with': 'pixivcomic'
        }
      });

      this.request.addListener('onload', data => {
        let textDecoder = new TextDecoder();
        let jsonData = JSON.parse(textDecoder.decode(data));

        this.context.title = jsonData.data.reading_episode.title;
        this.context.subTitle = jsonData.data.reading_episode.sub_title;
        this.context.numberingTitle = jsonData.data.reading_episode.numbering_title;
        this.context.workId = jsonData.data.reading_episode.work_id;
        this.context.workTitle = jsonData.data.reading_episode.work_title;
        this.context.pages = jsonData.data.reading_episode.pages.map(item => this.getImage(item));

        resolve(this.context);
      });

      this.request.addListener('onerror', error => {
        reject(error);
      });

      this.request.send();
    });
  }

  getImage(item) {
    return item.url;
  }

  getHighResolutionImage(url) {
    throw new Error('Hasn\'t implement, yet.')
  }
}

export default EpisodeAdapter;
