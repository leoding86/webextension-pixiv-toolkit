<a href="#zh_cn"><strong>中文</strong></a> | <a href="#en_us"><strong>English</strong></a>

------

# Help Information <span id="en_us></span>

## About `FFmpeg custom convert command` setting <span id="about-ffmpeg-custom-convert-command-en_us"></span>

You can use your own ffmpeg command line to convert ugoira to other format. There are several things you need to take care.

You just need to set arguments of ffmpeg command, like this `-f concat -i input.txt -safe 0 -c copy output.webm`. Beware, the arguments MUST include the `-f concat -i input.txt`, you can customize rest of the arguments.

There are some usually convert commend settings:
* Convert to gif: `-f concat -i input.txt -plays 0 out.gif`
* Convert to mp4: `-f concat -i input.txt -safe 0 -c copy output.webm`
* Convert to apng: `-f concat -i input.txt -plays 0 output.apng`
* Convert to webm: `-f concat -i input.txt -safe 0 output.webm`

-----

# 帮助信息 <span id="zh_cn"></span>


## 关于 `FFmpeg 自定义转化命令` 设置 <span id="about-ffmpeg-custom-convert-command-zh_cn"></span>

您可以使用自己的 ffmpeg 命令行将 ugoira 转换为其他格式。 您需要注意几件事。

只需要设置 ffmpeg 的参数，例如：`-f concat -i input.txt -safe 0 -c copy output.webm`。需要注意，其中`-f concat -i input.txt`为必须参数，之后的参数可以自行设置。

这里有些常用转换设置：

* 转换为gif：`-f concat -i input.txt -plays 0 out.gif`
* 转换为mp4：`-f concat -i input.txt -safe 0 -c copy output.webm`
* 转换为apng：`-f concat -i input.txt -plays 0 output.apng`
* 转换为webm: `-f concat -i input.txt -safe 0 output.webm`
