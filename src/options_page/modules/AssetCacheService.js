import AssetCacheRepo from '@/repositories/AssetCache';

export default class AssetCacheService {
  static instance;

  static getInstance() {
    if (!AssetCacheService.instance) {
      AssetCacheService.instance = new AssetCacheService();
    }

    return AssetCacheService.instance;
  }

  constructor() {
    this.assetCacheRepo = new AssetCacheRepo();
    this.cachedAssets = new Map();
    this.cachedLimit = 1000;
  }

  /**
   * Get cached asset
   * @returns {Promise}
   */
  getCache(url) {
    return new Promise(resolve => {
      if (this.cachedAssets.size > this.cachedLimit) {
        this.cachedAssets.delete(this.cachedAssets.entries().next());
      }

      if (this.cachedAssets.has(url)) {
        // console.log(`Get cache asset '${url}'`);
        resolve(this.cachedAssets.get(url));
        return;
      }

      this.assetCacheRepo.retrieveAsset(url).then(doc => {
        if (!this.cachedAssets.has(url)) {
          // console.log(`Cache asset '${url}'`);
          this.cachedAssets.set(url, doc.asset.data);
        }

        resolve(doc.asset.data);
      }).catch(err => {
        console.log(err); // Output error infomation
        this.fetchAsset(url).then(data => {
          /**
           * If the data is less then 100KB, cache it.
           */
          if (data.length <= 1024 * 100) {
            this.assetCacheRepo.putAsset(url, {
              url: url,
              data: data
            });

            resolve(data);

            return;
          }

          resolve(data);
        }).catch(err => {
          resolve(url);
        });
      });
    });
  }

  fetchAsset(url) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'blob';

      xhr.onload = () => {
        if (xhr.status === 200) {
          let reader = new FileReader();

          reader.onloadend = () => {
            resolve(reader.result);
          };

          reader.readAsDataURL(xhr.response);
        } else {
          reject(Error('Cannot fetch asset from remote'));
        }
      };

      xhr.onerror = err => {
        reject(err);
      };

      xhr.send();
    });
  }
}
