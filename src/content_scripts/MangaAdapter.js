import Browser from '@/modules/Browser/Browser';
import MangaTool from '@/content_scripts/manga/Manga';

class MangaAdapter {
  constructor() {
    this.illustContext;
    this.mangaTool;
    this.browser = Browser.getBrowser();
  }

  inital(context) {
    let self = this;

    return new Promise(resolve => {
      self.parseContext(context).then(context => {
        resolve(context);
      });
    })
  }

  parseContext(context) {
    let self = this;

    return new Promise((resolve, reject) => {
      self.illustContext = {
        illustId: context.illustId,
        illustTitle: context.illustTitle,
        userName: context.userName,
        userId: context.userId,
        userAcount: context.userAccount,
        urls: context.urls, // images
        r: context.xRestrict
      };

      let xhr = new XMLHttpRequest();

      xhr.open('GET', self.getMangaPagesUrl());

      xhr.onload = function () {
          let response = JSON.parse(this.responseText);

          if (response.error) {
              reject();
              return;
          }

          // Parse pages information here
          self.illustContext.pages = response.body;

          resolve(self.illustContext);
      }

      xhr.send();
    });
  }

  getMangaPagesUrl() {
    return '//www.pixiv.net/ajax/illust/' + this.illustContext.illustId + '/pages';
  }

  makeTool() {
    if (this.mangaTool) {
      this.mangaTool.context = this.illustContext;
      return this.mangaTool;
    }

    return this.mangaTool = new MangaTool(this.illustContext);
  }
}

export default MangaAdapter;
