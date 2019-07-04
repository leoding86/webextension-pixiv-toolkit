import browser from 'browser';

function Notification(options, attributes) {
    this.id;
    this.options = options;
    this.buttons = [];
    this.attributes = attributes;
}

Notification.create = function(options, attributes) {
    return new Notification(options, attributes);
};

Notification.prototype = {
    setAttribute: function (attribute, value) {
        if (!this.attributes || typeof this.attributes !== 'object') {
            this.attributes = {};
        }

        this.attributes[attribute] = value;
        return this;
    },

    setAttributes: function (attributes) {
        if (!!attributes && typeof attributes === 'object') {
            this.attributes = attributes;
        }

        return this;
    },

    updateNotificationId: function (notificationId) {
        this.id = notificationId;
    },

    /**
     * Argument options' struct { title: 'title', iconUrl: 'iconUrl }, iconUrl property is optional
     * @param {OBject} options
     * @param {function} callable
     */
    addButton: function (options, callable) {
        if (this.buttons.length >= 2) {
            console.warn('Notification buttons number is up to 2, now has 2');
            return;
        }

        var button = {};
        button.options = options;
        button.action = callable;

        this.buttons.push(button);
    },

    getButtonByIndex: function (buttonIndex) {
        var button = this.buttons[buttonIndex];

        return button ? button : null;
    },

    getNativeOptions: function () {
        var options = {};

        for (var i in this.options) {
            options[i] = this.options[i];
        }

        if (this.buttons.length > 0) {
            options.buttons = [];

            this.buttons.forEach(function (button) {
                options.buttons.push(button.options);
            });
        }

        return options;
    },

    close: function () {
        browser.notifications.clear(this.id);
    },

    send: function (callback, thisArg) {
        var self = this;

        browser.notifications.create(this.getNativeOptions(), function (notificationId) {
            self.updateNotificationId(notificationId);

            if (typeof callback === 'function') {
                callback.call(thisArg);
            }
        });
    }
};

export default Notification;
