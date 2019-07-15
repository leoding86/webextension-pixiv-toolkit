import Browser from '@/modules/Browser/Browser';
import { runtime as browserRuntime } from '@/content_scripts/Browser';
import UgoiraAdapter from './UgoiraAdapter';
import MangaAdapter from './MangaAdapter';
import IllustAdapter from './IllustAdapter'
import NovelAdapter from './NovelAdapter';

class Detector {

  static ILLUST_TYPE = 0;

  static MANGA_TYPE = 1;

  static UGOIRA_TYPE = 2;

  static NOVEL_TYPE = 9;

  constructor() {
    this.xhr = new XMLHttpRequest();
    this.browser = Browser.getBrowser();
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
      });
    });
  }

  checkPageType(url) {
    return new Promise((resolve, reject) => {
      if (url.match(/illust_id=\d+/)) {
        resolve(this.getIllustType(url));
      } else if (url.match(/novel\/show\.php\?id=\d+/)) {
        resolve(Detector.NOVEL_TYPE);
      } else {
        reject('Invalid page');
      }
    });
  }

  getIllustType(url) {
    let self = this;

    return new Promise((resolve, reject) => {
      let matches;

      matches = url.match(/illust_id=(\d+)/);

      self.xhr.open('GET', self.getIllustUrl(matches[1]));

      let json;

      self.xhr.onreadystatechange = () => {
        if (self.xhr.readyState === 4 && self.xhr.status === 200) {
          json = JSON.parse(self.xhr.responseText);

          if (json && json.body) {
            self.contextData = json.body;

            resolve(json.body.illustType);

            browserRuntime.sendMessage({
              action: 'activeIcon'
            });

            return;
          }

          browserRuntime.sendMessage({
            action: 'deactiveIcon'
          });

          reject('Invalid illust page')

          return;
        }
      }

      self.xhr.send();
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
      if (self.xhr) {
        self.xhr.abort();
      }

      let matches, novelId;

      if (matches = self.currentUrl.match(/novel\/show\.php\?id=(\d+)/)) {
        novelId = matches[1];
      } else {
        reject('Invalid novel page');
        return;
      }

      self.xhr.open('GET', self.getNovelUrl(novelId));

      self.xhr.onreadystatechange = () => {
        let json;

        if (self.xhr.readyState === 4 && self.xhr.status === 200) {
          json = JSON.parse(self.xhr.responseText);

          if (json && json.body) {
            self.contextData = json.body;

            resolve(self.injectNovelAdapter());

            browserRuntime.sendMessage({
              action: 'activeIcon'
            });

            return;
          }
        }

        browserRuntime.sendMessage({
          action: 'deactiveIcon'
        });
      }

      self.xhr.send();
    });
  }

  getIllustUrl(id) {
    return '//www.pixiv.net/ajax/illust/' + id;
  }

  getNovelUrl(id) {
    return '//www.pixiv.net/ajax/novel/' + id;
  }

  injectUgoiraAdapter() {
    let self = this;

    return new Promise((resolve, reject) => {
      if (!self.ugoiraAdapter) {
        self.ugoiraAdapter = new UgoiraAdapter();
      }

      self.ugoiraAdapter.inital(self.contextData).then(context => {
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
