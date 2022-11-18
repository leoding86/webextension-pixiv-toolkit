import EpubMaker from 'EpubMaker'

class Novel189 {
  constructor(context) {
    this.context = context;
    this.filename;
    this.epubMaker;
  }

  init() {
    return this.downloadNovel();
  }

  getEpubMaker() {
    return new EpubMaker()
      .withUuid(this.context.novelUrl)
      .withTemplate('idpf-wasteland')
      .withAuthor(this.context.userName)
      .withAttributionUrl(this.context.novelUrl)
      .withCover(this.context.novelCover)
      .withTitle(this.context.novelTitle);
  }

  writeSections() {
    let self = this;

    this.context.novelSections.forEach(section => {
      self.epubMaker.withSection(
        new EpubMaker.Section('bodymatter', null, {
          content: section
        }, false, false)
      );
    });
  }

  downloadNovel() {
    let self = this;

    return new Promise(resolve => {
      self.epubMaker = self.getEpubMaker();

      self.writeSections();

      self.epubMaker.downloadEpub((epubZipContent, filename) => {
        let blob = URL.createObjectURL(epubZipContent);
        self.filename = filename;
        resolve(blob);
      });
    });
  }
}

export default Novel189;
