import {
  permissions as browserPermissions,
  downloads as browserDownloads
} from '@/content_scripts/Browser';
import browser from '@/modules/Extension/browser';
import formatName from "@/modules/Util/formatName";
import pathjoin from '@/modules/Util/pathjoin';
import MimeType from '@/modules/Util/MimeType';

export default {
  methods: {
    /**
     *
     * @param {{url: string, filename: string}} param
     */
    downloadFileUsingLink({ url, filename }) {
      let a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', filename);

      /**
       * The a element must append to document to make download working in Firefox
       */
      document.body.appendChild(a);

      a.click();
      a.remove();
    },

    /**
     *
     * @param {{ data: ArrayBuffer|Blob, file: string, saveAs: boolean }} param
     * @returns {Promise}
     */
    createBrowserDownload({ data, file, saveAs }) {
      let url = null;

      if (data instanceof Blob) {
        url = URL.createObjectURL(data);
      } else {
        const mimeType = MimeType.getFileMimeType(file);
        url = URL.createObjectURL(new Blob([data], {type: mimeType}));
      }

      return browserDownloads.download({ url, filename: file, saveAs });
    },

    /**
     * Update statistic of download
     */
    updateDownloadStat(type) {
      browser.runtime.sendMessage({
        action: 'updateDownloadedStat',
        args: type,
      });
    },

    /**
     *
     * @param {ArrayBuffer|Blob} src
     * @param {string} filename
     * @returns {Promise<number, Error>}
     */
    downloadFile({ src, filename, folder = null }) {
      const saveAs = this.browserItems.saveAs;

      /**
       * Check if the extension takeover downloads setting is enabled
       */
      if (this.browserItems.enableExtTakeOverDownloads) {
        /**
         * Check if the extension has the permission of downloads
         */
        return browserPermissions.contains({
          permissions: ['downloads']
        }).then(result => {
          /**
           * If the extension has the downloads permission, then pass the data to background for downloading item,
           * otherwise, throw a alert prompt
           */
          if (result) {
            const file = pathjoin(folder ? folder : this.browserItems.downloadRelativeLocation, filename);

            /**
             * If the browser is Firefox, then call downloadFileUsingData because the Firefox don't support download
             * file throught url using download api.
             */
            return this.createBrowserDownload({ data: src, file, saveAs });
          } else {
            throw new Error('You need grant download permission for downloading using downlads setting in extension');
          }
        })
      } else {
        let url = null;

        if (src instanceof Blob) {
          url = URL.createObjectURL(src);
        } else {
          url = URL.createObjectURL(new Blob([src], { type: MimeType.getFileMimeType(filename) }));
        }

        this.downloadFileUsingLink({ url, filename });

        /**
         * Should return a Promise instance
         */
        return Promise.resolve(0);
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
