<a href="#zh_cn">中文</a> | <a href="#en_us" id="en_us"><strong>English</strong></a>

<h2 align="center">Pixiv Toolkit Next (v6.0.0)</h2>

<p align="center">
  <a href="https://circleci.com/gh/leoding86/webextension-pixiv-toolkit"><img src="https://img.shields.io/circleci/build/github/leoding86/webextension-pixiv-toolkit?logo=circleci"></a>
  <a href="https://chrome.google.com/webstore/detail/ajlcnbbeidbackfknkgknjefhmbngdnj"><img src="https://img.shields.io/chrome-web-store/users/ajlcnbbeidbackfknkgknjefhmbngdnj?logo=google%20chrome&logoColor=white"></a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/pixiv-toolkit/"><img src="https://img.shields.io/amo/rating/pixiv-toolkit?logo=Firefox%20Browser&logoColor=white"></a>
</p>

Pixiv Toolkit Next is the next major update of Pixiv Toolkit for preview. There are some breaking changes compare with current Pixiv Toolkit. If you are using old version and ready to use this version, please read the content below for more details.

## **How to use**

There is a layer with a arrow will appear at the center bottom of the page if the page has available content. Click the arrow to active the action panel. Before you start your download, you need open the extension download manager first. Then enjoy.

----------

## **6.0.0 Break changes:**

### **1. Move download process to standalone option page from content script.**
In current Pixiv Toolkit, the download is processed in content script which is the target page, user must be waiting the download complete before visit other pages, it could be frustrating if user want downloads multiple resources at same time because it need keep multiple tabs opened at same time.

In this version, all downloads are in a standalone option page. When user click the download button on target page, the extension will parse the information, then send to extension's download manager. So user don't need keep the target page open for downloading.

### **2. Remove `gif.js` and `whammy` library, animation generation will be handled by `FFmpeg.wasm.`**
FFmpeg.wasm is a very powerful library, and it has much better performance then others library like gif.js and whammy. The downside is that FFmpeg.wasm is much larger in size, but it just only take a little more time to download the extension when installation.

### **3. Remove `js-epub-maker` library, epub generation won't work for now.**
`js-epub-maker` library dependency `handlebars` library which use `eval` and `Function` function for working. In manifest v3, there is no chance to use `eval` and `Function` function for policy reason, so for now, `js-epub-maker` won't work which means epub generation won't work too.

I'm planning to create a small library which don't need `eval` and `Function` function for generating epub file later.

### **4. Refactor history feature and mirgate download history to it.**
New history feature except records Pixiv visit history, it also can records Pixiv Comic and Fanbox visit history. If the resource has been downloaded, there'll be a downloaded tag present in the record. The old download hsitory feature is removed.

It should be aware that since manifest v3 extension no longer has running background page, there is no way to persist the browsing history in background. If you need to record the browsing history, you need to keep the Download Manager open then the browsing history can be saved.

### **5. Don't pack the images to zip file anymore.**
In this version of Pixiv Toolkit, it won't pack the downloaded images into a zip file anymore, it will save the images one by one. So for the best user experience, there are some advises below to follow.

### **6. Simplify rename feature.**

----------

## **Advises for the best user experience**

* The browser will popup a dialog which let user decide whether allow or deny to download multiple files automatically. Please click **Allow**, or the download will be aborted, and If you want download multiple files using the extension later, you must go to browser settings to do some setting work to make it work again.
* Disable `Ask where to save each file before downloading` setting, otherwise there will be a choose save file dialog popup before every each file saving.
* You can disable download shelf in the extension option settings for preventing the download shelf appear when download start.
* You can make the extension download manager page to a web application using browser apps setting.

----------

## **Other imformations**

### **Locations of automatically downloads setting in different browsers**

* Edge - [edge://settings/content/automaticDownloads](edge://settings/content/automaticDownloads)
* Chrome - [chrome://settings/content/automaticDownloads](chrome://settings/content/automaticDownloads)

### **Locations of Ask where to save each file before downloading setting in different browsers**

* Edge - [edge://settings/downloads](edge://settings/downloads)
* Chrome - [chrome://settings/downloads](chrome://settings/downloads)

### **Locations of apps setting in different browsers**

* Edge - [edge://apps](edge://apps)
* Chrome - [chrome://apps](chrome://apps)

### **Not test on Firefox**

Will be done later.

----------

## **How to install**
If you are using Chrome, you can download it from [Chrome web store](https://chrome.google.com/webstore/detail/pixiv-toolkit/ajlcnbbeidbackfknkgknjefhmbngdnj).

## **How to build**
To build the extension, you need these tools below:

* nodejs
* python2

After you install these, run commands step by step:

```bash
npm install
npm run build # build for Chrome
```

Then you can install the extension manually.

## **Something wrong?**

Please feel free to submit a issue if you have trouble with using it.


-----
-----
<a href="#zh_cn" id="zh_cn"><strong>中文</strong></a> | <a href="#en_us">English</a>

<h2 align="center">Pixiv Toolkit Next (v6.0.0)</h2>

Pixiv Toolkit Next 是 Pixiv Toolkit 下一个重要更新的预览版本，为了适配浏览器插件`manifest v3`版本，其中包含了一些重大更改。如果你使用过原始版本请先阅读重大更新的内容以了解详细信息。

## **如何使用**

如果页面上有可用的资源，那么会在页面的底部显示一个箭头，点击箭头以激活面板。在开始下载之前，你需要先打开插件的下载管理器。

----------

## **6.0.0 重大更改：**

### **1. 将下载任务从内容页移动到独立页面**
在原版本的 Pixiv Toolkit 中，下载是在内容页，也就是目标页面，进行的，用户必须等待下载完成才能访问别的页面，如果用户需要同时下载多个页面资源，将可能会是一件令人沮丧的事情，因为需要保持多个页面标签在浏览器中打开。

在这个版本中，下载任务都是在第一个独立的页面进行的。当用户点击页面上的下载按钮时，插件会解析出信息并将其发送到插件的下载管理器。所以用户不再需要保持目标在浏览器中打开。

### **2. 移除`gif.js`和`whammy`库，动画生成将会由`FFmpeg.wasm`处理。**
FFmpeg.wasm 是一个非常强大的库，它拥有比其他库，如`gif.js`和`whammy`，更强的性能。缺点就是它的文件大小有些大，但是这仅会在下载安装插件的时候多花一点点时间。

### **3. 移除`js-epub-maker`库, epub文件的生成功能暂时不可用.**
`js-epub-maker`库以来`handlerbars`库来正常工作，`handlerbars`需要使用`eval`和`Function`函数，而由于浏览器插件`manifest v3`的政策，这两个函数是无法在背景页、内容页和选项页中使用。所以`js-epub-maker`无法在当前的插件中正常工作，也就无法正常生成`epub`文件。

我计划后期创建一个不使用`eval`和`Function`函数的库来生成`epub`文件。

### **4. 重构历史记录功能，并合并下载记录**
新的历史记录功能除了能记录P站的浏览记录，还能记录Pixiv Comic和Fanbox的浏览记录。如果相关资源被下载，那么会在记录条目上显示`已下载`标签。旧的下载记录功能被移除。

需要注意的是，由于manifest v3不再存在背景页所以没有办法在背景持久化存储导致不能在背景页中保存浏览历史。如果需要记录浏览历史，你需要保持打开下载管理器，这样浏览记录就可以被保存。

### **5. 不再将下载的图片打包成压缩包**
在这个版本中，插件不再将下载的图片打包成压缩包，图片将会被一张张保存。为了最好的用户体验，后面有一些可遵循的建议。

### **6. 简化重命名功能**

----------

## **最佳用户体验建议**

* 当用户首次在短时间内保存多个文件的时候，浏览器会提示用户是否允许同时下载多张图片。请选择**允许**，否则将会导致下载中断，并且如果以后需要此功能则需要在浏览器相关设置中进行设置才可以；
* 禁用`下载前询问每个文件的保存位置`设置，否则在插件保存保存每个文件的时候都会弹出选择保存位置的对话框；
* 你可以在插件设置中禁用下载架来阻止下载架的显示；
* 你可以使用浏览器应用功能将插件的下载管理器保存成一个应用。

----------

## **其他信息**

### **不同浏览器自动下载设置的位置**

* Edge - [edge://settings/content/automaticDownloads](edge://settings/content/automaticDownloads)
* Chrome - [chrome://settings/content/automaticDownloads](chrome://settings/content/automaticDownloads)

### **不同浏览器下载前询问每个文件的保存位置设置的位置**

* Edge - [edge://settings/downloads](edge://settings/downloads)
* Chrome - [chrome://settings/downloads](chrome://settings/downloads)

### **不同浏览器应用设置的位置**

* Edge - [edge://apps](edge://apps)
* Chrome - [chrome://apps](chrome://apps)

### **尚未在火狐上测试**
后面会做。

----------

## **如何安装**

## **如何构建**
你需要一下的工具来进行构造：

* nodejs
* python2

安装完成后，执行以下操作来进行构造：

```bash
npm install
npm run build # build for Chrome
```

之后你可以手动安装插件

## **碰到问题了？**

如果在使用过程中碰到问题，请创建一个issue。
