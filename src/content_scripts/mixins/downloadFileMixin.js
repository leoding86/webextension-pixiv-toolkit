import {
  permissions as browserPermissions,
  downloads as browserDownloads
} from '@/content_scripts/Browser';
import browser from '@/modules/Extension/browser';
import formatName from "@/modules/Util/formatName";

export default {
  methods: {
    downloadFile(url, filename, { folder = null, statType = null }) {
      let vm = this;
      let blob = null;

      if (url instanceof Blob) {
        blob = url;
        url = URL.createObjectURL(url);
      }

      /**
       * Because some sercurity reason of Firefox, the background script cannot download blob url from other sites.
       */
      if (this.browserItems.enableExtTakeOverDownloads) {
        browserPermissions.contains({
          permissions: ['downloads']
        }).then(result => {
          if (result) {
            let filepath = '';

            if (folder) {
              filepath += folder;
            } else if (vm.browserItems.downloadRelativeLocation) {
              filepath += vm.browserItems.downloadRelativeLocation;
            }

            filepath += filename;

            if (this.isFirefox && blob) {
              let fileReader = new FileReader();

              fileReader.readAsArrayBuffer(blob);

              fileReader.onload = event => {
                browser.runtime.sendMessage({
                  action: 'download',
                  options: {
                    arrayBuffer: fileReader.result,
                    filename: filepath,
                    saveAs: vm.browserItems.downloadSaveAs
                  }
                });
              }
            } else {
              browserDownloads.download({
                url: url,
                filename: filepath,
                saveAs: vm.browserItems.downloadSaveAs
              });
            }
          } else {
            alert('You need grant download permission for downloading using downlads setting in extension');
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

      if (statType) {
        browser.runtime.sendMessage({
          action: 'updateDownloadedStat',
          args: statType
        });
      }
    },

    getSubfolder(folderName, context) {
      let folder = '';

      if (folderName) {
        let folders = folderName.split('/');

        folders = folders.map(item => {
          if (item === "") {
            return "";
          }

          return formatName(item, context, item);
        });

        folder = folders.join('/');
      }

      return folder;
    }
  }
}
