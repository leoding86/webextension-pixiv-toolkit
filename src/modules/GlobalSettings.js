const GlobalSettings = (fallback) => {
  if (window.$app) {
    return window.$app.settings;
  } else {
    return fallback;
  }
};

export default GlobalSettings;