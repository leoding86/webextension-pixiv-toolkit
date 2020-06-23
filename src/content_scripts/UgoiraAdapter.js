import DateFormatter from '@/modules/Util/DateFormatter';
import Request from '@/modules/Net/Request';
import UgoiraTool from '@/content_scripts/ugoira/Ugoira'

class UgoiraAdapter {
  constructor() {
    this.illustContext
    this.ugoiraTool
    this.options = {};
  }

  inital({ context, options }) {
    this.options = options;

    return new Promise((resolve, reject) => {
      this.parseContext(context).then(context => {
        resolve(context);
      }).catch(() => {
        reject();
      });
    });
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
        urls: context.urls, // images
        r: context.xRestrict,

        id: context.illustId,
        title: context.illustTitle,
        comment: context.illustComment,
        description: context.description,
        createDate: context.createDate,
        uploadDate: context.uploadDate,
        type: 'ugoira',
        bookmarkCount: context.bookmarkCount,
        likeCount: context.likeCount,
        responseCount: context.responseCount,
        viewCount: context.viewCount,

        // contexts from parsed
        year: dateFormatter.getYear(),
        month: dateFormatter.getMonth(),
        day: dateFormatter.getDay()
      };

      let request = new Request(this.buildMetaUrl(this.illustContext.illustId), { method: 'GET' });

      request.addListener('onload', data => {
        let response = JSON.parse(String.fromCharCode.apply(null, data));

        if (response.error) {
          reject();
          return;
        }

        self.illustContext.illustSrc = response.body.src;
        self.illustContext.illustOriginalSrc = response.body.originalSrc;
        self.illustContext.illustFrames = response.body.frames;
        self.illustContext.illustMimeType = response.body.mime_type;

        let duration = 0

        self.illustContext.illustFrames.forEach(function (frame) {
          duration += frame.delay;
        });

        self.illustContext.illustDuration = duration;

        resolve(self.illustContext);
      });

      request.send();
    });
  }

  buildMetaUrl(userId) {
    return 'https://www.pixiv.net/ajax/illust/' + userId + '/ugoira_meta';
  }

  makeTool() {
    if (!this.ugoiraTool) {
      this.ugoiraTool = new UgoiraTool();
    }

    this.ugoiraTool.context = this.illustContext;
    this.ugoiraTool.animationJsonFormat = this.options.animationJsonFormat;

    return this.ugoiraTool;
  }
}

export default UgoiraAdapter;
