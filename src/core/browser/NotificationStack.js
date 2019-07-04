import browser from 'browser';

function NotificationStack() {
    this.notifications = {};
}

NotificationStack.prototype = {
    addNotification: function (notification) {
        if (notification instanceof Notification) {
            notification.send(function () {
                this.notifications[notification.id] = notification;
            }, this);
            return;
        }

        console.warn('argument notification must be a instance of Notification');
    },

    retrieveByNotificationId: function (notificationId) {
        if (this.notifications[notificationId]) {
            return this.notifications[notificationId];
        }

        return null;
    },

    removeNotification: function (notification) {
        if (notification instanceof Notification) {
            notificationId = notification.id;
        } else if (typeof notification === 'number') {
            notificationId = notification;
        } else {
            console.warn('argument notification must be a instance of Notification or number type');
        }

        if (typeof this.notifications === 'object' && this.notifications[notificationId]) {
            delete this.notifications[notificationId];
            browser.notifications.clear(notificationId);
        }

        return this;
    }
};

export default NotificationStack;
