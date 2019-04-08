let _pumd = window._pumd = {};

_pumd.fence = {
    data: {},

    put: function (key, object) {
        this.data[key] = object;
    },

    remove: function (key) {
        if (this.data[key]) {
            delete this.data[key];
        }
    },

    get: function (key) {
        return this.data[key];
    },

    has: function (key) {
        return !!this.data[key];
    }
};

_pumd.common = (function () {
    let common = window.common = {
        metas   : {},
        storage : {},
        lan     : {}
    };

    common.storage.set = function(value, callback) {
        callback = typeof callback == 'function' ? callback : function() {}
        chrome.storage.local.set(value, callback);
    };

    common.storage.get = function(key, callback) {
        callback = typeof callback == 'function' ? callback : function() {}
        chrome.storage.local.get(key, callback);
    };

    common.storage.clear = function(callback) {
        callback = typeof callback == 'function' ? callback : function() {}
        chrome.storage.local.clear(callback);
    };

    // 生成指定长度的随机字符串
    common.getRandomStr = function(len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i = 0; i < len; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    // 注入DOM并将DOM的data属性复制为想要的参数
    common.getTargetPageVar = function(obj, type) {
        var injectDom = document.createElement('div');
        injectDom.setAttribute('id', 'dom-' + randomStr);
        injectDom.setAttribute('style', 'display:none');
        document.documentElement.appendChild(injectDom);
        var script = '(function(){';
        script += 'var string = null;';
        script += 'try {';
        script += 'if (typeof ' + obj + ' == "string") string = ' + obj + ';';
        script += 'else if (typeof ' + obj + ' == "object") string = JSON.stringify(' + obj + ');';
        script += '} catch (e) {';
        script += 'string = null';
        script += '}';
        script += 'document.querySelector("#dom-' + randomStr + '").setAttribute("data", string);';
        script += '})()';
        var injectScript = document.createElement('script');
        injectScript.setAttribute('id', 'js-' + randomStr);
        injectScript.setAttribute('style', 'display:none');
        injectScript[(injectScript.innerText === undefined ? 'textContent' : 'innerText')] = script;
        document.documentElement.appendChild(injectScript);
        var domData = document.querySelector('#dom-' + randomStr).getAttribute('data');

        // clearup
        document.querySelector('#dom-' + randomStr).remove();
        document.querySelector('#js-' + randomStr).remove();

        if (type === 'string')
            return domData;
        else if (type === 'object' || type === 'json')
            return JSON.parse(domData);
        else
            return null;
    }

    common.lan.msg = function(name) {
        return chrome.i18n.getMessage(name);
    }

    common.metas = {
        id       : {content : common.lan.msg('id'), key : 'illustId', possibleKeys: ['illustId']},
        title    : {content : common.lan.msg('title'), key : 'illustTitle', possibleKeys: ['illustTitle']},
        author   : {content : common.lan.msg('author'), key : 'userName', possibleKeys: ['userName', 'illustAuthor']},
        authorId : {content : common.lan.msg('author_id'), key : 'userId', possibleKeys: ['userId', 'illustAuthorId']},
        pageNum  : {content : common.lan.msg('page_num'), key: 'pageNum', possibleKeys: ['pageNum']}
    }

    common.getContextMetaValue = function(context, meta) {
        var meta = common.metas[meta];

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
    },

    common.classname = function(classname) {
        return '_pumd_' + classname;
    }

    common.objFirst = function(obj) {
        return obj[Object.keys(obj)[0]];
    }

    common.formatName = function(renameFormat, context, fallback) {
        if (!renameFormat) {
            return fallback;
        }

        var matches = renameFormat.match(/\{[a-z]+\}/ig);
        var name = renameFormat;

        if (matches && matches.length > 0) {
            matches.filter(function(item, pos) {
                return matches.indexOf(item) == pos;
            }).forEach(function (match) {
                var key = match.slice(1, -1);
                var val = common.getContextMetaValue(context, key);

                if (val !== undefined) {
                    name = name.replace(match, val);
                }
            });
        }

        return !!name ? name : fallback;
    }

    common.debug = {
        ping: function() {
            // console.log('ping has not been implemented yet');
        }
    }

    common.console = window.console;

    return common;
})();

_pumd.button = (function() {
    var button = {};

    button.getBtn = function(selector) {
        return document.querySelector(selector);
    }

    button.addBtn = function(string, id, to) {
        var btn = document.createElement('a');
        btn.href = 'javascript:void(0)';
        if (typeof id == 'string') {
            btn.setAttribute('id', id);
        }
        btn.innerText = string;

        if (to !== undefined) {
            if (typeof to == 'string') {
                document.querySelector(to).appendChild(btn);
            } else {
                to.appendChild(btn);
            }
        }
        else {
            if (document.querySelector('.bookmark-container') != null) {
                document.querySelector('.bookmark-container').appendChild(btn);
            } else {
                document.querySelector('.userdata').appendChild(btn);
            }
        }
        return btn;
    }

    button.notice = function(selector, string) {
        document.querySelector(selector).innerText = string;
    }

    button.addDownloadLink = function(selector, url, string) {
        var btn = document.querySelector(selector)
        btn.href = url;
        btn.setAttribute('download', string);
    }

    return button;
})();

_pumd.RetryTicker = (function () {
    function RetryTicker(max) {
        this.maxTry = max;
        this.tryTimes = 0;
    }

    RetryTicker.prototype = {
        reset: function () {
            this.retryTimes = 0;
        },

        reachLimit: function () {
            if (this.tryTimes < this.maxTry) {
                this.tryTimes++;
                return false;
            }

            return true;
        },
    };

    return RetryTicker;
})();

var randomStr = _pumd.common.getRandomStr(10);
