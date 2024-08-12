/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-12 12:45:02
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-12 19:06:00
 * @FilePath: \webextension-pixiv-toolkit\src\background\services\DownloadFileService.js
 */
/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-12 12:45:02
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-12 13:34:26
 * @FilePath: \webextension-pixiv-toolkit\src\background\services\DownloadFileService.js
 */
import AbstractPortService from "./AbstractPortService";
import Download from "@/modules/Net/Download";

class DownloadFileService extends AbstractPortService {
  static instance;

  /**
   * @return {Map<any, Download>}
   */
  portDownloadMap = new Map();

  static getServce() {
    if (!DownloadFileService.instance) {
      DownloadFileService.instance = new DownloadFileService();
    }

    return DownloadFileService.instance;
  }

  postMessage(port, event, data) {
    port.postMessage({
      event,
      data
    });
  }

  onDisconnect(port) {
    if (this.portDownloadMap.has(port)) {
      this.portDownloadMap.delete(port);
    }
  }

  onMessage(args) {
    const port = args.port;

    if (args.action === 'download' && typeof args.url === 'string') {
      const download = new Download(args.url, args.options || void 0);

      this.portDownloadMap.set(port, download);

      download.addListener('onprogress', progress => {
        this.postMessage(port, 'progress', { progress });
      });
      download.addListener('onerror', error => {
        this.postMessage(port, 'error', { error: error.message });
      });
      download.addListener('onfinish', (data, mimeType) => {
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = reader.result;
          this.postMessage(port, 'complete', { data: b64, mimeType });
        };
        reader.readAsDataURL(data);
      });
      download.addListener('onabort', () => {
        this.postMessage(port, 'abort');
      });

      download.download();
    } else if (args.action === 'abort') {
      const download = this.portDownloadMap.get(port);

      if (download) {
        download.abort();
      }
    }
  }
}

export default DownloadFileService;
