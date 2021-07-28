<a href="#zh_cn"><strong>中文</strong></a> | <a href="#en_us"><strong>English</strong></a>

------

# Help Information <span id="en_us></span>

## About the `Pack Files` setting in download setting <span id="about-the-pack-files-setting-en_us"></span>

* If the setting is enabled, the extension will pack downloaded images to a zip file and download.
* If the setting is disabled, the extension will not pack the downloaded images to a zip file and download them one by one into target folder. The folder name will respect relative rename setting.

### CAUTION

If you download images when the setting is disabled, the browser will popup a dialog which let user decide whether allow or deny to download multiple files automatically. Please click **Allow**, or the download will be aborted, and If you want download multiple files using the extension later, you must go to browser settings to do some setting work to make it work again.

### Locations of automatically downloads setting of different browsers

* Edge - [edge://settings/content/automaticDownloads](edge://settings/content/automaticDownloads)
* Chrome - [chrome://settings/content/automaticDownloads](chrome://settings/content/automaticDownloads)
* FireFox - Don't have the setting, you can download multiple files automatically by default

## About ugoira convert tools <span id="about-ugoira-convert-tools-en_us"></span>

There are two converters for converting ugoira to GIF, they are gifjs and ffmpeg. There are some differences between these two converters.

The FFmpeg used in the browser is based on the technology of the browser webassmbly, so there may be big differences in performance in different browsers. According to my test, in Edge (based on Chroimun), the performance of FFmpeg is lower than the default converter, low speed and high CPU usage. But in Chrome, the performance of FFmpeg is better than the default converter, the CPU usage is low, and the speed of converting is similar. But when you use FFmpeg, the progress notification is completely wrong, I don't have any clues about this problem for now.

Therefore, you can compare these 2 converters and choose the one you like.

## About `FFmpeg custom convert command` setting <span id="about-ffmpeg-custom-convert-command-en_us"></span>

You can use your own ffmpeg command line to convert ugoira to other format. There are several things you need to take care.

First, the `{framerate}` placehold, the placehold will be replaced by actal frame rate. For example, let's say the frame rate is 25, the command like this `ffmpeg -r {framerate} -i %06d.jpg -vcodec libx264 -crf 25 out.mp4` will be transform to this `ffmpeg -r 25 -i %06d.jpg -vcodec libx264 -crf 25 out.mp4`. `{framerate}` was replaced by 25.

Second, you need to put the output file with extension name at the last of the command to make sure the converter can parse context information properly. For example, you should use command like this `ffmpeg -r 25 -i %06d.jpg -vcodec libx264 -crf 25 out`, the output file don't have extension name, and the converter can't save the file properly.

Third, the input setting MUST be `-i %06d.jpg`, don't change it or the generator will not work.

-----

# 帮助信息 <span id="zh_cn"></span>

## 关于下载设置中的`打包文件`设置的说明 <span id="about-the-pack-files-setting-zh_cn"></span>

* 当启用此选项时，会将多张下载的图片（图集，漫画等）打包进一个ZIP文件中，然后下载。
* 当禁用此选项时，会单独下载每一张图片，并将其保存到指定的目录中，其目录的名称将遵循相关的设置。

### 注意

禁用此选项时下载图片，浏览器会提示用户是否允许同时下载多张图片。请选择**允许**，否则将会导致下载中断，并且如果以后需要此功能则需要在浏览器相关设置中进行设置才可以。

### 不同浏览器的自动下载设置的位置

* Edge - [edge://settings/content/automaticDownloads](edge://settings/content/automaticDownloads)
* Chrome - [chrome://settings/content/automaticDownloads](chrome://settings/content/automaticDownloads)
* FireFox - 没有相关设置，默认情况下就可以自动下载多个文件

## 关于动图转化工具 <span id="about-ugoira-convert-tools-zh_cn"></span>

有两个转换器可以将动图转换为 GIF，它们分别是是 gifjs 和 ffmpeg。 这两个转换器之间存在一些差异。

浏览器中使用的FFmpeg是基于浏览器webassmbly的技术，所以在不同浏览器中性能可能会有很大差异。 根据我的测试，在Edge（基于Chroimun）中，FFmpeg的性能低于默认转换器，速度低，CPU占用率高。 但是在 Chrome 中，FFmpeg 的性能比默认转换器要好，CPU 使用率低，转换速度也差不多。 但是当你使用FFmpeg时，进度通知是完全错误的，我暂时没有关于这个问题的任何线索。

因此，您可以比较这两款转换器并选择您喜欢的一款。

## 关于 `FFmpeg 自定义转化命令` 设置 <span id="about-ffmpeg-custom-convert-command-zh_cn"></span>

您可以使用自己的 ffmpeg 命令行将 ugoira 转换为其他格式。 您需要注意几件事。

首先是`{framerate}`占位符，占位符会被实际帧率代替。 例如，假设帧率为 25，这样的命令 `ffmpeg -r {framerate} -i %06d.jpg -vcodec libx264 -crf 25 out.mp4` 将被转换为这个 `ffmpeg -r 25 -i %06d.jpg -vcodec libx264 -crf 25 out.mp4`。

其次，您需要将带有扩展名的输出文件放在命令的最后，以确保转换器可以正确解析上下文信息。 例如，你应该使用这样的命令`ffmpeg -r 25 -i %06d.jpg -vcodec libx264 -crf 25 out`，输出文件没有扩展名，转换器无法正确保存文件。

第三，输入设置必须是`-i %06d.jpg`，不要更改，否则生成器将无法工作。
