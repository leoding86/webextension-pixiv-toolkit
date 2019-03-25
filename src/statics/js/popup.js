(function(window, common){
    let setting = {
        timeout : null,
        msg     : function(string) {
            if (this.timeout != null || this.timeout != undefined) {
                clearTimeout(this.timeout);
            }
            document.querySelector('#setting-msg').innerText = string;
            this.timeout = setTimeout(function() {
                document.querySelector('#setting-msg').innerText = '';
            }, 2000);
        }
    }

    let createMeta = function(name, content) {
        let btn = document.createElement('button');
        btn.className = 'meta btn btn-default btn-xs';
        btn.setAttribute('type', 'button');
        btn.setAttribute('data-name', name);
        btn.innerText = content;
        return btn;
    }

    let getMeta = function(el) {
        let meta = el.getAttribute('data-name');
        return (meta == null || meta == '') ? null : meta;
    }

    let usedMetasSortHandle = function(evt) {
        let metaEls = evt.to.querySelectorAll('.meta');
        let settings = { titleMetas : [] };
        metaEls.forEach(function(el) {
            let key = getMeta(el);
            if (key != null) {
                settings.titleMetas.push(key);
            }
        });

        common.storage.set(settings, function() {
            if (chrome.runtime.lastError == '' || chrome.runtime.lastError == undefined) {
                setting.msg(common.lan.msg('setting_saved'));
                // console.log('设置已保存');
            } else {
                setting.msg(common.lan.msg('setting_error'));
                // console.log(chrome.runtime.lastError);
            }
        });
    }

    let ugoiraQuanlityChange = function (evt) {
        let settings = { ugoiraQuanlity: 10 };

        for (let i in this.options) {
            if (this.options[i].selected) {
                settings.ugoiraQuanlity = this.options[i].value;
                common.storage.set(settings, function () {
                    if (chrome.runtime.lastError == '' || chrome.runtime.lastError == undefined) {
                        setting.msg(common.lan.msg('setting_saved'));
                        // console.log('设置已保存');
                    } else {
                        setting.msg(common.lan.msg('setting_error'));
                        // console.log(chrome.runtime.lastError);
                    }
                });
                break;
            }
        }
    }

    let enableMetasEl = document.querySelector('#enable-metas');
    let usedMetasEl = document.querySelector('#used-metas');
    let ugoiraQuanlityEl = document.querySelector('#ugoira-quanlity');
    let ugoiraQuanlityList = [
        {value: 1, text: common.lan.msg('ugoira_best')},
        {value: 5, text: common.lan.msg('ugoira_good')},
        {value: 10, text: common.lan.msg('ugoira_normal')},
    ];
    for (let i in ugoiraQuanlityList) {
        let option = document.createElement('option');
        option.value = ugoiraQuanlityList[i].value;
        option.text = ugoiraQuanlityList[i].text;
        ugoiraQuanlityEl.appendChild(option);
    }

    common.storage.get(null, function(items) {
        let enableMetas = common.metas; // 元数据配置
        let usedMetas = {};

        if (items.titleMetas === undefined) items.titleMetas = [];

        items.titleMetas.forEach(function(key) {
            if (enableMetas[key] !== undefined) {
                usedMetasEl.appendChild(createMeta(key, enableMetas[key].content));
                delete enableMetas[key];
            }
        });

        for (let key in enableMetas) {
            enableMetasEl.appendChild(createMeta(key, enableMetas[key].content));
        }

        Sortable.create(enableMetasEl, {
            group: "metas",
            animation: 150
        });
        Sortable.create(usedMetasEl, {
            group: "metas",
            animation: 150,
            onSort: usedMetasSortHandle
        });

        if (items.ugoiraQuanlity === undefined) items.ugoiraQuanlity = 10;
        for (let i in ugoiraQuanlityEl.options) {
            if (ugoiraQuanlityEl.options[i].value == items.ugoiraQuanlity) {
                ugoiraQuanlityEl.options[i].selected = 'selected';
                break;
            }
        }

        ugoiraQuanlityEl.addEventListener('change', ugoiraQuanlityChange);
    });
})(window, _pumd.common);