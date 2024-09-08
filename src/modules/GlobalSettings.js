/**
 * @typedef GlobalSettings
 * @property {number} downloadSaveMode
 * @property {number} globalZipMultipleImages
 * @property {number} downloadSaveMode
 *
 * @param {*} fallback
 * @returns {GlobalSettings}
 */
const GlobalSettings = (fallback) => {
  if (window.$app) {
    return window.$app.settings;
  } else {
    return fallback;
  }
};

export default GlobalSettings;
