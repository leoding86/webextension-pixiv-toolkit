import DateFormatter from '@/modules/Util/DateFormatter';
import Request from '@/modules/Net/Request';
import UnsupportedPostType from '@/errors/UnsupportedPostType';
import config from '@/fanbox/config';

export default class PostAdapter {

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
    if (!PostAdapter.instance) {
      PostAdapter.instance = new PostAdapter();
    }

    return PostAdapter.instance;
  }

  init() {
    this.url = null;
    this.creatorId = null;
    this.postId = null;
    this.context = {
      illustId: null,
      creatorId: null,
      userId: null,
      userName: null,
      postId: null,
      postTitle: null,
      images: [],
      year: null,
      month: null,
      day: null,
    };
  }

  setUrl(url) {
    if (this.request) {
      this.request.abort();
    }

    this.init();

    this.url = url;

    let matches = url.match(config.post_url_pattern) || url.match(config.post_url_pattern2);

    this.creatorId = this.context.creatorId = matches[1];
    this.postId = this.context.postId = matches[2];
  }

  getUrl() {
    return config.post_url.replace('{post_id}', this.postId);
  }

  getContext() {
    return new Promise((resolve, reject) => {
      this.request = new Request(this.getUrl(), {
        method: 'GET',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        }
      });

      this.request.addListener('onload', data => {
        let jsonData = JSON.parse(String.fromCharCode.apply(null, data));

        if (!jsonData.body) {
          reject(new Error('Empty body context'));
          return;
        }

        let dateFormatter = new DateFormatter(jsonData.body.publishedDatetime);

        this.context.illustId = jsonData.body.id;
        this.context.userId = jsonData.body.user.userId;
        this.context.userName = jsonData.body.user.name;
        this.context.postTitle = jsonData.body.title;
        this.context.year = dateFormatter.getYear();
        this.context.month = dateFormatter.getMonth();
        this.context.day = dateFormatter.getDay();
        this.context.pages = this.findImages(jsonData);

        resolve(this.context);
      });

      this.request.addListener('onerror', error => {
        reject(error);
      });

      this.request.send();
    });
  }

  findImages(data) {
    const postType = data.body.type;

    if (postType === PostAdapter.ARTICLE_TYPE) {
      return this.filterImagesFromArticlePost(data);
    } else if (postType === PostAdapter.IMAGE_TYPE) {
      return this.filterImagesFromImagePost(data);
    } else {
      throw new UnsupportedPostType();
    }
  }

  filterImagesFromArticlePost(data) {
    let images = [];

    data.body.body.blocks.forEach(item => {
      if (item.type === 'image' && data.body.body.imageMap[item.imageId]) {
        images.push(data.body.body.imageMap[item.imageId].originalUrl);
      }
    });

    return images;
  }

  filterImagesFromImagePost(data) {
    let images = [];

    data.body.body.images.forEach(image => {
      images.push(image.originalUrl);
    });

    return images;
  }
}
