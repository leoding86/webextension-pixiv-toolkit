import {
  permissions as browserPermissions,
  downloads as browserDownloads
} from '@/content_scripts/Browser';
import browser from '@/modules/Extension/browser';

export default {
  methods: {
    downloadFile(url, filename, extra) {
      let vm = this;

      /**
       * Because some sercurity reason of Firefox, the background script cannot download blob url from other sites.
       */
      if (!this.isFirefox && this.browserItems.enableExtTakeOverDownloads) {
        browserPermissions.contains({
          permissions: ['downloads']
        }).then(result => {
          if (result) {
            browserDownloads.download({
              url: url,
              filename: vm.browserItems.downloadRelativeLocation + filename
            })
          } else {
            alert('You need grant download permission for downloading using downlads setting in extension')
          }
        })
      } else {
        let a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);

        /**
         * The a element must append to document to make download working in Firefox
         */
        document.body.appendChild(a);

        a.click()
        a.remove()
      }

      if (extra && extra.statType) {
        browser.runtime.sendMessage({
          action: 'updateDownloadedStat',
          args: extra.statType
        });
      }
    }
  }
}
