import browser from 'browser';

function Badge() {
    this.autoRender = false,
    this.tabId,
    this.backgroundColor,
    this.text;
}

Badge.prototype = {
    setAutoRender: function (boolean) {
        this.autoRender = boolean;
    },

    setTabId: function(tabId) {
        this.tabId = tabId;
        this.conditionRender();
        return this;
    },

    setBackgroundColor: function (backgroundColor) {
        this.backgroundColor = backgroundColor;
        this.conditionRender();
        return this;
    },

    setText: function (text) {
        this.text = text;
        this.conditionRender();
        return this;
    },

    conditionRender: function () {
        if (this.autoRender) {
            this.render();
        }
    },

    render: function() {
        browser.browserAction.setBadgeText({text: this.text, tabId: this.tabId});
        browser.browserAction.setBadgeBackgroundColor({color: this.bgColor, tabId: this.tabId});
    }
}

export default Badge;
