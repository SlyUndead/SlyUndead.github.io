import * as cornerstone from '@cornerstonejs/core';
import cornerstoneWebImageLoader from '@cornerstonejs/web-image-loader';

// Register the custom image loader
cornerstone.registerImageLoader('base64', cornerstoneWebImageLoader.loadImage);

export default function loadBase64Image(imageId) {
  return cornerstone.loadImage(imageId);
}
