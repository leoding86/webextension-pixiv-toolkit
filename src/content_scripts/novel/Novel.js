import NovelEpubGenerator from '@/modules/Generator/NovelEpubGenerator';
import NovelTxtGenerator from '@/modules/Generator/NovelTxtGenerator';

class Novel {
  constructor(context) {
    this.context = context;
  }

  getId() {
    return this.context.id;
  }

  getUserId() {
    return this.context.userId
  }

  getUserName() {
    return this.context.userName
  }

  getTitle() {
    return this.context.novelTitle
  }

  isR() {
    return !!this.context.r
  }

  inSeries() {
    return this.context.hasOwnProperty('seriesId')
           && this.context.hasOwnProperty('seriesTitle');
  }

  getCover() {
    return this.context.novelCover;
  }

  getGenerator(type) {
    switch (type) {
      case 'epub':
        return new NovelEpubGenerator();
      case 'txt':
        return new NovelTxtGenerator();
      default:
        throw Error(`Unkown generator type "${type}"`);
    }
  }
}

export default Novel;
