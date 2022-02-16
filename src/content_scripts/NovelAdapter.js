import Browser from '@/modules/Browser/Browser';
import Novel from '@/content_scripts/novel/Novel';
import DateFormatter from '@/modules/Util/DateFormatter';

class NovelAdapter {
  constructor() {
    this.browser = Browser.getBrowser();
    this.novelContext;
    this.novelTool;
  }

  inital(context) {
    let self = this;

    return new Promise(resolve => {
      self.parseContext(context);
      resolve(self.novelContext);
    });
  }

  parseContext(context) {
    let sectionContents = context.content.split(/[\r\n|\r|\n]\[newpage\][\r\n|\r\n]/i);

    let sections = sectionContents.map(content => {
      let newContent = content.replace(/[\r\n|\r|\n]/g, '<br />');
      return newContent;
    });

    let dateFormatter = DateFormatter.getDefault(context.createDate);

    this.novelContext = {
      novelId: context.id,
      novelTitle: context.title,
      novelSections: sections,
      novelDescription: context.description,
      novelCover: context.coverUrl,
      novelUrl: window.location.href,
      userId: context.userId,
      userName: context.userName,
      r: context.xRestrict,

      id: context.id,
      title: context.title,
      description: context.description,
      createDate: context.createDate,
      uploadDate: context.uploadDate,
      type: 'Novel',
      bookmarkCount: context.bookmarkCount,
      likeCount: context.likeCount,
      responseCount: context.responseCount,
      viewCount: context.viewCount,

      // contexts from parsed
      year: dateFormatter.getYear(),
      month: dateFormatter.getMonth(),
      day: dateFormatter.getDay()
    }

    // series data
    if (context.seriesNavData) {
      this.novelContext.seriesId = context.seriesNavData.seriesId;
      this.novelContext.seriesTitle = context.seriesNavData.title;
      this.novelContext.seriesOrder = context.seriesNavData.order;
    }
  }

  makeTool() {
    if (this.novelTool) {
      this.novelTool.context = this.novelContext;
      return this.novelTool;
    }

    return this.novelTool = new Novel(this.novelContext);
  }
}

export default NovelAdapter;
