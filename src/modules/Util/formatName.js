import I18n from "../Browser/I18n";

export default (renameFormat, context, fallback) => {
  let specials = {
    win: {
      illegals: [
        '<', '>', ':', '"', '/', '\\', '|', '?', '*'
      ],
      /**
      illegalNames: [
        "con","aux","nul","prn","com0","com1","com2","com3","com4","com5","com6","com7","com8","com9","lpt0","lpt1","lpt2","lpt3","lpt4","lpt5","lpt6","lpt7","lpt8","lpt9"
      ],
      */
      max: 200 // full path limitation is 258
    },
    linux: {
      illegals: [
        '/', /** not suggest to use */ '@', '#', '$', '&', '\'',
      ],
      max: 256
    },
    unix: {
      illegals: [
        '/'
      ],
      max: 256
    }
  };

  let filename = '';

  function getContextMetaValue(context, key) {
    let i18n = I18n.getI18n();

    var metas = {
      id: {
        content: i18n.getMessage('id'),
        key: 'illustId',
        possibleKeys: ['id', 'illustId', 'novelId', 'postId']
      },
      title: {
        content: i18n.getMessage('title'),
        key: 'illustTitle',
        possibleKeys: ['title', 'illustTitle', 'novelTitle', 'postTitle']
      },
      author: {
        content: i18n.getMessage('author'),
        key: 'userName',
        possibleKeys: ['userName', 'illustAuthor']
      },
      authorId: {
        content: i18n.getMessage('author_id'),
        key: 'userId',
        possibleKeys: ['userId', 'illustAuthorId']
      },
      pageNum: {
        content: i18n.getMessage('page_num'),
        key: 'pageNum',
        possibleKeys: ['pageNum']
      },
      year: {
        content: i18n.getMessage('year'),
        key: 'year',
        possibleKeys: ['year']
      },
      month: {
        content: i18n.getMessage('month'),
        key: 'month',
        possibleKeys: ['month']
      },
      day: {
        content: i18n.getMessage('day'),
        key: 'day',
        possibleKeys: ['day']
      },
      startPageNum: {
        content: i18n.getMessage('start_page_number'),
        key: 'startPageNum',
        possibleKeys: ['startPageNum']
      },
      lastPageNum: {
        content: i18n.getMessage('last_page_number'),
        key: 'lastPageNum',
        possibleKeys: ['lastPageNum']
      },
      seriesId: {
        content: i18n.getMessage('_series_id'),
        key: 'seriesId',
        possibleKeys: ['seriesId']
      },
      seriesTitle: {
        content: i18n.getMessage('_series_title'),
        key: 'seriesTitle',
        possibleKeys: ['seriesTitle']
      },
      "seriesOrder": {
        content: i18n.getMessage('_series_order'),
        key: 'seriesOrder',
        possibleKeys: ['seriesOrder']
      }
    };

    let meta = metas[key];

    if (!meta) {
      if (context.hasOwnProperty(key)) {
        return context[key];
      }
    } else {
      let keys = meta.possibleKeys;

      for (let i = 0, l = keys.length; i < l; i++) {
        if (context[keys[i]] !== undefined) {
          return context[keys[i]];
        }
      }
    }

    return;
  }

  fallback += '';

  if (!renameFormat) {
    filename = fallback;
  } else {
    var matches = renameFormat.match(/\{[a-z]+\}/ig);
    var name = renameFormat;

    if (matches && matches.length > 0) {
      matches.forEach(function (match) {
        var key = match.slice(1, -1);
        var val = getContextMetaValue(context, key);

        if (val !== undefined) {
          name = name.replace(match, val);
        }
      });
    }

    filename = !!name ? name : fallback;
  }

  /**
   * Because chrome.runtime.getPlatformInfo is a async operation, for the sake of simplicity, we
   * use merged rule to filter filename.
   **/
  let illegals = specials.win.illegals.concat(
    specials.linux.illegals,
    specials.unix.illegals,
    '~' // chrome do not allow it
  );

  illegals.forEach(char => {
    while (filename.indexOf(char) > -1) {
      filename = filename.replace(char, '_');
    }
  });

  /**
   * Remove dots at end of the filename
   */
  filename = filename.replace(/\.*$/, '');

  filename = filename.substr(0, specials.win.max);

  return filename.length === 0 ? `file_${Date.now()}` : filename;
};
