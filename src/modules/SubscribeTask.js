function SubscribeTask (subscribedUsers) {
  this.subscribedUsers = subscribedUsers;

  this.taskHandle = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
      self.subscribedUsers.forEach(function (user) {
        self.getUserWorks(user).then(function (works) {
          var updates = self.getUpdates(user, works);

          // update user subscribe info
        });
      });
    });
  }

  this.getUserWorks = function (user) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('get', 'https://www.pixiv.net/ajax/user/' + user.id + '/profile/all');
      xhr.onreadystatechange = function () {
        if (xhr.status === 4) {
          if (xhr.stateCode === 200) {
            var data = JSON.parse(xhr.responseText);

            resolve({
              illusts: Object.keys(data.body.illusts),
              manga: Object.keys(data.body.manga)
            });

            return;
          }

          reject();
        }
      }
    });
  }

  this.getUpdates = function (user, works) {
    var updatesCounter = {
      illusts: 0,
      manga: 0
    }

    works.illusts.forEach(function (illustId) {
      if (user.lastestIllustId < illustId) {
        updatesCounter.illusts++;
      }
    });

    works.manga.forEach(function (mangaId) {
      if (user.lastestMangaId < mangaId) {
        updatesCounter.manga++;
      }
    });

    return updatesCounter;
  }
};

module.exports = SubscribeTask;
