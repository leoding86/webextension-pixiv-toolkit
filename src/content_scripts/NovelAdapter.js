import Browser from '@/modules/Browser/Browser';
import Novel189 from '@/content_scripts/novel/Novel189';

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

    this.novelContext = {
      novelId: context.id,
      novelTitle: context.title,
      novelSections: sections,
      novelDescription: context.description,
      novelCover: context.coverUrl,
      userId: context.userId,
      userName: context.userName,
    }
  }

  makeTool() {
    if (this.novelTool) {
      this.novelTool.context = this.novelContext;
      return this.novelTool;
    }

    return this.novelTool = new Novel189(this.novelContext);
  }
}

export default NovelAdapter;
