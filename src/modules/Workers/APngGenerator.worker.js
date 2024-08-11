/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-11 22:13:46
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-11 22:15:41
 * @FilePath: \webextension-pixiv-toolkit\src\modules\Workers\APngGenerator.worker.js
 */
import APNG from '@/modules/Util/APNG';

self.onmessage = event => {
  // APNG.debug.enable();

  APNG.event.addListener('onProgress', (currentProgress, totalProgress) => {
    self.postMessage({
      progress: {
        currentProgress: currentProgress,
        totalProgress: totalProgress
      }
    });
  });

  let png = APNG.encode(event.data.imagesData, event.data.size.width, event.data.size.height, 0, event.data.delays);

  self.postMessage({
    arrayBuffer: png
  });
};
