function InjectionMonitor() {
    this.injectedTabIds = {};
}

InjectionMonitor.prototype = {
    hasTabInjected: function (tabId) {
        return this.injectedTabIds.hasOwnProperty(tabId);
    },

    tabInjected: function (tabId, attributes) {
        attributes = attributes ? attributes : {};

        this.injectedTabIds[tabId] = attributes;
    },

    removeTab: function (tabId) {
        if (this.hasTabInjected(tabId)) {
            delete this.injectedTabIds[tabId];
        }
    }
}

export default InjectionMonitor;