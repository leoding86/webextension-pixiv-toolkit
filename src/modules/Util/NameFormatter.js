/**
 * @class NameFormatter formate string from rule
 */
class NameFormatter {
  /**
   * Define illegal chars in target name
   */
  illegalChars = [
    '<', '>', ':', '"', '/', '\\', '|', '?', '*',
    '/', /** not suggest to use */ '@', '#', '$', '&', '\'',
  ];

  context = {};

  /**
   *
   * @param {*} param0
   * @returns {NameFormatter}
   */
  static getFormatter({ context }) {
    let instance = new NameFormatter();
    return instance.setContext(context);
  }

  /**
   * Set context
   * @param {object} context
   * @return {this}
   */
  setContext(context) {
    this.context = context;
    return this;
  }

  getContextMetaValue(key) {
    let metas = {
      id: {
        possibleKeys: ['illustId', 'id', 'novelId', 'postId']
      },
      title: {
        possibleKeys: ['illustTitle', 'title', 'novelTitle', 'postTitle']
      },
      author: {
        possibleKeys: ['userName', 'illustAuthor']
      },
      authorId: {
        possibleKeys: ['userId', 'illustAuthorId']
      },
      pageNum: {
        possibleKeys: ['pageNum']
      },
      year: {
        possibleKeys: ['year']
      },
      month: {
        possibleKeys: ['month']
      },
      day: {
        possibleKeys: ['day']
      },
      startPageNum: {
        possibleKeys: ['startPageNum']
      },
      lastPageNum: {
        possibleKeys: ['lastPageNum']
      },
      seriesId: {
        possibleKeys: ['seriesId']
      },
      seriesTitle: {
        possibleKeys: ['seriesTitle']
      },
      seriesOrder: {
        possibleKeys: ['seriesOrder']
      },
      workTitle: {
        possibleKeys: ['workTitle'],
      },
      numberingTitle: {
        possibleKeys: ['numberingTitle'],
      }
    };

    let meta = metas[key];

    if (meta) {
      for (let key of meta.possibleKeys) {
        if (this.context[key] !== undefined) {
          return this.context[key] + '';
        }
      }
    }

    return;
  }

  filterIllegalChars(name) {
    this.illegalChars.forEach(char => {
      while (name.indexOf(char) > -1) {
        name = name.replace(char, '_');
      }
    });

    name = name.replace(/\u{200B}/ug, ' ');

    return name;
  }

  /**
   * Format name from rule
   * @param {string} rule
   * @param {string} fallbackName
   * @returns {string}
   */
  format(rule, fallbackName = '') {
    if (!rule) {
      return fallbackName;
    }

    /**
     * Split rule into pieces because the rule might include directories rule.
     */
    let subRules = rule.split(/[/|\\]/).filter(sub => sub.length > 0);
    let subNames = [];

    subRules.forEach(subRule => {
      /**
       * Get all meta placeholders
       */
      let matches = subRule.match(/\{[a-z]+\}/ig);
      let name = subRule;

      if (matches && matches.length > 0) {
        let offset = 0;

        matches.forEach(match => {
          let metaValue = this.getContextMetaValue(match.slice(1, -1));

          /**
           * When a meta value found, first find the start and end positions of
           * the meta placeholder with offset param, then replace the meta
           * placeholder with meta value which using string combination, then
           * forward the offset and do it again from begining. it will make sure
           * that when if the meta value include other placeholders which will not
           * be replaced repeatly.
           */
          if (metaValue !== undefined) {
            let matchStartPos = name.indexOf(match, offset);
            let matchEndPos = matchStartPos + match.length;

            name = name.substring(0, matchStartPos) + metaValue + name.substr(matchEndPos);

            offset = (matchStartPos + metaValue.length);
          }
        });
      }

      let filteredName = this.filterIllegalChars(name);

      /**
       * Windows filename length limitation is 200
       * Linux filename length limitation is 256
       * Unix filename length is same as Linux
       * So we pick 200 as the filename length limitation
       */
      subNames.push(filteredName.length > 0 ? filteredName.substr(0, 200) : 'undefined');
    });

    let name = subNames.filter(subName => subName.length > 0).join('/');

    return name.length === 0 ? `file_${Date.now}` : name;
  }
}

export default NameFormatter;
