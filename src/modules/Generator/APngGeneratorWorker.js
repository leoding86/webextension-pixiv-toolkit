import UPNG from 'upng-js';

self.onmessage = event => {
  let png = UPNG.encode(event.data.imagesData, event.data.size.width, event.data.size.height, 0, event.data.delays);

  self.postMessage({
    arrayBuffer: png
  });
};

export default {}
