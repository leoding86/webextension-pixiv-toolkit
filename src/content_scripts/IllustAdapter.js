import Browser from '@/modules/Browser/Browser';
import IllustTool from '@/content_scripts/illust/Illust';
import Request from '@/modules/Util/Request';

class IllustAdapter {
  constructor() {
    this.illustContext;
    this.illustTool;
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
    if (this.illustTool) {
      this.illustTool.context = this.illustContext;
      return this.illustTool;
    }

    return this.illustTool = new IllustTool(this.illustContext);
  }
}

export default IllustAdapter;
