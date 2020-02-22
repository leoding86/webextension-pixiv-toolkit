import NovelGenerator from '@/modules/Generator/NovelGenerator';

class Novel {
  constructor(context) {
    this.context = context;
    this.novelGenerator = new NovelGenerator();
  }

  getId() {
    return this.context.id;
  }

  prepareProps() {
    this.novelGenerator.setProps({
      uuid: this.context.novelUrl,
      author: this.context.userName,
      attributionUrl: this.context.novelUrl,
      cover: this.context.novelCover,
      title: this.context.novelTitle
    });
  }

  prepareSections() {
    this.context.novelSections.forEach(section => {
      this.novelGenerator.appendSection(section);
    });
  }

  includeDescription() {
    this.novelGenerator.appendSection(this.context.novelDescription);
  }

  generateNovel() {
    return this.novelGenerator.makeEpub();
  }

  isR() {
    return !!this.context.r
  }
}

export default Novel;
