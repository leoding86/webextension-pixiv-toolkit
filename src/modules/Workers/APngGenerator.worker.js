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
