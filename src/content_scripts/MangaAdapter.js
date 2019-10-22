import Browser from '@/modules/Browser/Browser';
import MangaTool from '@/content_scripts/manga/Manga';
import Request from '@/modules/Util/Request';

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

      let request = new Request();

      request.open('GET', self.getMangaPagesUrl());

      request.event.addListener('onload', response => {
        response.json().then(json => {
          if (json.error) {
              reject();
              return;
          }

          // Parse pages information here
          self.illustContext.pages = json.body;

          resolve(self.illustContext);
        }).catch(error => {
          reject();
        });
      });

      request.send();
    });
  }

  getMangaPagesUrl() {
    return 'https://www.pixiv.net/ajax/illust/' + this.illustContext.illustId + '/pages';
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
