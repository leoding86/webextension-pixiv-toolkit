import EpubMaker from 'EpubMaker';

export default class NovelEpubGenerator {
  constructor(context) {
    this.context = context;
    this.epubMaker = new EpubMaker();
    this.epubMaker.withTemplate('idpf-wasteland');
  }

  addMeta(meta, value) {
    let withMethod = 'with' + meta.charAt(0).toUpperCase() + meta.slice(1);

    if (typeof this.epubMaker[withMethod] === 'function') {
      this.epubMaker[withMethod](value);
    }

    return this;
  }

  appendSection(section) {
    this.epubMaker.withSection(
      new EpubMaker.Section('bodymatter', null, {
        content: section
      }, false, false)
    );

    return this;
  }

  makeBook() {
    return new Promise(resolve => {
      this.epubMaker.downloadEpub(blob => {
        resolve(blob);
      });
    });
  }
}
