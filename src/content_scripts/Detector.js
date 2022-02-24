import IllustAdapter from './IllustAdapter'
import InvalidPageError from '@/content_scripts/errors/InvalidPageError';
import MangaAdapter from './MangaAdapter';
import NovelAdapter from './NovelAdapter';
import Request from '@/modules/Net/Request';
import UgoiraAdapter from './UgoiraAdapter';

class Detector {

  static UNDETERMINED_TYPE = -99;

  static ILLUST_TYPE = 0;

  static MANGA_TYPE = 1;

  static UGOIRA_TYPE = 2;

  static NOVEL_TYPE = 9;

  static UNSUPPORTED_TYPE = -1;

  constructor() {
    this.request;
    this.currentUrl;
    this.currentType;
    this.currentTool;
    this.contextData;
    this.ugoiraAdapter;
    this.mangaAdapter;
    this.illustAdapter
    this.novelAdapter;
  }

  init(url) {
    let self = this;

    this.currentUrl = url;

    return new Promise((resolve, reject) => {
      self.checkPageType(url).then(type => {
        self.currentType = type;

        resolve();
      }).catch(error => {
        reject(error);
      });
    });
  }

  fetchIllustId(url) {
    let regexes = [
      /illust_id=(\d+)/,
      /artworks\/(\d+)/
    ];

    for (let i = 0, l = regexes.length; i < l; i++) {
      let matches = url.match(regexes[i]);

      if (matches) {
        return matches[1];
      }
    }

    return;
  }

  checkPageType(url) {
    return new Promise((resolve, reject) => {
      let illustId = this.fetchIllustId(url);

      if (illustId) {
        resolve(this.getIllustType(illustId));
        return;
      }

      if (url.match(/novel\/show\.php\?id=\d+/)) {
        resolve(Detector.NOVEL_TYPE);
        return;
      }

      reject(new InvalidPageError('invalid_page'));
    });
  }

  getIllustType(illustId) {
    let self = this;

    return new Promise((resolve, reject) => {
      this.request && this.request.abort();

      this.request = new Request(this.getIllustUrl(illustId), { method: 'GET' });

      this.request.addExclusiveListener('onload', data => {
        let textDecoder = new TextDecoder();
        let json = JSON.parse(textDecoder.decode(data));

        if (json && json.body) {
          self.contextData = json.body;

          browser.runtime.sendMessage({
            action: 'activeIcon'
          });

          resolve(json.body.illustType);
        } else {
          browser.runtime.sendMessage({
            action: 'deactiveIcon'
          });
        }
      });

      this.request.addExclusiveListener('onerror', error => {
        reject(error);
      });

      this.request.send();
    });
  }

  injectPage() {
    let self = this;

    return new Promise(resolve => {
      switch (self.currentType) {
        case Detector.UGOIRA_TYPE:
        case Detector.MANGA_TYPE:
        case Detector.ILLUST_TYPE:
          resolve(self.injectIllust());
          break;
        case Detector.NOVEL_TYPE:
          resolve(self.injectNovel());
          break;
      }

      resolve();
    });
  }

  injectIllust() {
    let self = this;

    return new Promise(resolve => {
      if (self.currentType === Detector.UGOIRA_TYPE) {
        resolve(self.injectUgoiraAdapter());
      } else if (self.currentType === Detector.MANGA_TYPE) {
        resolve(self.injectMangaAdapter());
      } else if (self.currentType === Detector.ILLUST_TYPE) {
        resolve(self.injectIllustAdapter());
      }
    });
  }

  injectNovel() {
    let self = this;

    return new Promise((resolve, reject) => {
      this.request && this.request.abort();

      let matches, novelId;

      if (matches = self.currentUrl.match(/novel\/show\.php\?id=(\d+)/)) {
        novelId = matches[1];
      } else {
        reject(new InvalidPageError('invalid_novel_page'));
        return;
      }

      this.request = new Request(self.getNovelUrl(novelId), { method: 'GET' });
      this.request.responseType = 'plain';

      this.request.addExclusiveListener('onload', data => {
        let json = JSON.parse(data);

        if (json && json.body) {
          self.contextData = json.body;

          resolve(self.injectNovelAdapter());

          browser.runtime.sendMessage({
            action: 'activeIcon'
          });

          return;
        } else {
          browser.runtime.sendMessage({
            action: 'deactiveIcon'
          });
        }
      });

      this.request.send();
    });
  }

  getIllustUrl(id) {
    return 'https://www.pixiv.net/ajax/illust/' + id;
  }

  getNovelUrl(id) {
    return 'https://www.pixiv.net/ajax/novel/' + id;
  }

  injectUgoiraAdapter() {
    let self = this;

    return new Promise((resolve, reject) => {
      if (!self.ugoiraAdapter) {
        self.ugoiraAdapter = new UgoiraAdapter();
      }

      self.ugoiraAdapter.inital({
        context: self.contextData,
        options: {
          animationJsonFormat: window.$extension.getItem('animationJsonFormat')
        }
      }).then(context => {
        let ugoiraTool = self.currentTool = self.ugoiraAdapter.makeTool();
        // ugoiraTool.run().show();

        resolve(ugoiraTool);
      });
    });
  }

  injectMangaAdapter() {
    let self = this;

    return new Promise((resolve, reject) => {
      if (!self.mangaAdapter) {
        self.mangaAdapter = new MangaAdapter();
      }

      self.mangaAdapter.inital(self.contextData).then(context => {
        let mangaTool = self.currentTool = self.mangaAdapter.makeTool();

        resolve(mangaTool);
      })
    });
  }

  injectIllustAdapter() {
    let self = this

    return new Promise((resolve, reject) => {
      if (!self.illustAdapter) {
        self.illustAdapter = new IllustAdapter()
      }

      self.illustAdapter.inital(self.contextData).then(context => {
        let illustTool = self.currentTool = self.illustAdapter.makeTool()

        resolve(illustTool)
      })
    });
  }

  injectNovelAdapter() {
    let self = this;

    return new Promise(resolve => {
      if (!self.novelAdapter) {
        self.novelAdapter = new NovelAdapter();
      }

      self.novelAdapter.inital(self.contextData).then(context => {
        let novelTool = self.currentTool = self.novelAdapter.makeTool();
        // novelTool.run().show();

        resolve(novelTool);
      });
    })
  }
}

export default Detector;
