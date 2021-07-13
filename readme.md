<p align="center">
  <img src="https://raw.githubusercontent.com/leoding86/webextension-pixiv-toolkit/master/src/statics/icon128.png"><br><br>
</p>

<p align="center">
  <a href="https://circleci.com/gh/leoding86/webextension-pixiv-toolkit"><img src="https://img.shields.io/circleci/build/github/leoding86/webextension-pixiv-toolkit/master?logo=circleci&token=e46c87fa8bb712ab70284f1be692d0d9035da8d4"></a>
  <a href="https://chrome.google.com/webstore/detail/ajlcnbbeidbackfknkgknjefhmbngdnj"><img src="https://img.shields.io/chrome-web-store/users/ajlcnbbeidbackfknkgknjefhmbngdnj?logo=google%20chrome&logoColor=white"></a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/pixiv-toolkit/"><img src="https://img.shields.io/amo/rating/pixiv-toolkit?logo=Firefox%20Browser&logoColor=white"></a>
</p>

<h2 align="center">Pixiv Toolkit</h2>

Pixiv Tookit is a webextension for Pixiv users. You can download animation, manga, illusion and novel from Pixiv with using this.

## How to install
If you are using Chrome, you can download it from [Chrome web store](https://chrome.google.com/webstore/detail/pixiv-toolkit/ajlcnbbeidbackfknkgknjefhmbngdnj).

If you are using Firefox, you can download it from [Firefox Add-ons](https://addons.mozilla.org/addon/pixiv-toolkit/).

If you are not using Chrome or Firefox, you can try clone the project to your local machine, and build the extension by yourself.

## How to build
To build the extension, you need these tools below:

* nodejs
* python2

After you install these, run commands step by step:

```bash
npm install
npm run build # build for Chrome
npm run build:firefox # or build for Firefox
```

Then you can install the extension manually.

## How to use

There is a layer with a arrow will appear at the center bottom of the page if the page has available content. Click the arrow to active the action panel, then enjoy.

## Something wrong?

Please feel free to submit a issue if you have trouble with using this.
