import EpubMaker from 'EpubMaker';

export default class NovelGenerator {
  constructor(context) {
    this.context = context;
    this.epubMaker = new EpubMaker();
  }

  setProps(props) {
    for (let key in props) {
      let withMethod = 'with' + key.charAt(0).toUpperCase() + key.slice(1);

      if (typeof this.epubMaker[withMethod] === 'function') {
        this.epubMaker[withMethod](props[key]);
      }
    }

    this.epubMaker.withTemplate('idpf-wasteland');
  }

  appendSection(section) {
    this.epubMaker.withSection(
      new EpubMaker.Section('bodymatter', null, {
        content: section
      }, false, false)
    );
  }

  makeEpub() {
    return new Promise(resolve => {
      this.epubMaker.downloadEpub(epubZipContent => {
        let blob = URL.createObjectURL(epubZipContent);
        resolve(blob);
      });
    });
  }
}
