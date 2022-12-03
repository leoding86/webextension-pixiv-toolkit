<a href="#zh_cn"><strong>中文</strong></a> | <a href="#en_us"><strong>English</strong></a>

------

# Help Information <span id="en_us></span>

## About `FFmpeg custom convert command` setting <span id="about-ffmpeg-custom-convert-command-en_us"></span>

You can use your own ffmpeg command line to convert ugoira to other format. There are several things you need to take care.

First, the `{framerate}` placehold, the placehold will be replaced by actal frame rate. For example, let's say the frame rate is 25, the command like this `ffmpeg -r {framerate} -i %06d.jpg -vcodec libx264 -crf 25 out.mp4` will be transform to this `ffmpeg -r 25 -i %06d.jpg -vcodec libx264 -crf 25 out.mp4`. `{framerate}` was replaced by 25.

Second, you need to put the output file with extension name at the last of the command to make sure the converter can parse context information properly. For example, use command like this `ffmpeg -r 25 -i %06d.jpg -vcodec libx264 -crf 25 out`, the output file don't have extension name, and the converter can't save the file properly.

Third, the input setting MUST be `-i %06d.jpg`, don't change it or the generator will not work.

-----

# 帮助信息 <span id="zh_cn"></span>


## 关于 `FFmpeg 自定义转化命令` 设置 <span id="about-ffmpeg-custom-convert-command-zh_cn"></span>

您可以使用自己的 ffmpeg 命令行将 ugoira 转换为其他格式。 您需要注意几件事。

首先是`{framerate}`占位符，占位符会被实际帧率代替。 例如，假设帧率为 25，这样的命令 `ffmpeg -r {framerate} -i %06d.jpg -vcodec libx264 -crf 25 out.mp4` 将被转换为这个 `ffmpeg -r 25 -i %06d.jpg -vcodec libx264 -crf 25 out.mp4`。

其次，您需要将带有扩展名的输出文件放在命令的最后，以确保转换器可以正确解析上下文信息。 例如，使用这样的命令`ffmpeg -r 25 -i %06d.jpg -vcodec libx264 -crf 25 out`，输出文件没有扩展名，转换器无法正确保存文件。

第三，输入设置必须是`-i %06d.jpg`，不要更改，否则生成器将无法工作。
