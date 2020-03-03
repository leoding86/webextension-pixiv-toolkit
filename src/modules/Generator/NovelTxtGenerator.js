export default class NovelTxtGenerator {
  constructor() {
    this.meta = {};
    this.content = [];
  }

  addMeta(meta, value) {
    this.meta[meta] = value;

    return this;
  }

  appendSection(section) {
    section = section.replace(/<br\s*\/>/ig, "\r\n").trim();

    this.content.push(section);

    return this;
  }

  makeBook() {
    let avaliableMeta = ['attributionUrl', 'author', 'title'];

    avaliableMeta.forEach(meta => {
      if (this.meta[meta]) {
        this.content.unshift(this.meta[meta]);
      }
    });

    let content = this.content.join("\r\n".repeat(2));

    let blob = new Blob([content], { type: 'text/plain' });

    return Promise.resolve(blob);
  }
}
