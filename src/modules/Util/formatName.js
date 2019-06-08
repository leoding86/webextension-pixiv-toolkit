import I18n from "../Browser/I18n";

export default (renameFormat, context, fallback) => {
  function getContextMetaValue(context, key) {
    let i18n = I18n.getI18n();

    var metas = {
      id: {
        content: i18n.getMessage('id'),
        key: 'illustId',
        possibleKeys: ['illustId']
      },
      title: {
        content: i18n.getMessage('title'),
        key: 'illustTitle',
        possibleKeys: ['illustTitle']
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
      }
    };

    let meta = metas[key];

    if (!meta) {
      return;
    }

    var keys = meta.possibleKeys;

    for (var i = 0, l = keys.length; i < l; i++) {
      if (context[keys[i]] !== undefined) {
        return context[keys[i]];
      }
    }

    return;
  }

  fallback += '';

  if (!renameFormat) {
    return fallback.replace('/', '\/');
  }

  var matches = renameFormat.match(/\{[a-z]+\}/ig);
  var name = renameFormat;

  if (matches && matches.length > 0) {
    matches.filter(function (item, pos) {
      return matches.indexOf(item) == pos;
    }).forEach(function (match) {
      var key = match.slice(1, -1);
      var val = getContextMetaValue(context, key);

      if (val !== undefined) {
        name = name.replace(match, val);
      }
    });
  }

  let filename = !!name ? name : fallback;

  return filename.replace('/', '_')
};
