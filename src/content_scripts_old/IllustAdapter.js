import Browser from '@/modules/Browser/Browser';
import DateFormatter from '@/modules/Util/DateFormatter';
import IllustTool from '@/content_scripts/illust/Illust';
import Request from '@/modules/Net/Request';

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

    let dateFormatter = DateFormatter.getDefault(context.createDate);

    return new Promise((resolve, reject) => {
      self.illustContext = {
        illustId: context.illustId,
        illustTitle: context.illustTitle,
        userName: context.userName,
        userId: context.userId,
        userAcount: context.userAccount,
        urls: context.urls, // Difference sizes thumbnail urls
        r: context.xRestrict,

        id: context.illustId,
        title: context.illustTitle,
        comment: context.illustComment,
        description: context.description,
        createDate: context.createDate,
        uploadDate: context.uploadDate,
        type: 'Illust',
        bookmarkCount: context.bookmarkCount,
        likeCount: context.likeCount,
        responseCount: context.responseCount,
        viewCount: context.viewCount,

        // contexts from parsed
        year: dateFormatter.getYear(),
        month: dateFormatter.getMonth(),
        day: dateFormatter.getDay()
      };

      let request = new Request(this.getMangaPagesUrl(), { method: 'GET' });

      request.addListener('onload', data => {
        let json = JSON.parse(String.fromCharCode.apply(null, data));

        if (json.error) {
          reject();
          return;
        }

        // Parse pages information here
        self.illustContext.pages = json.body;

        resolve(self.illustContext);
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
