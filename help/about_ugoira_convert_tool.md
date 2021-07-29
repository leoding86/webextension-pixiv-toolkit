# About ugoira convert tools

There are two converters for converting ugoira to GIF, they are gifjs and ffmpeg. There are some differences between these two converters.

The FFmpeg used in the browser is based on the technology of the browser webassmbly, so there may be big differences in performance in different browsers. According to my test, in Edge (based on Chroimun), the performance of FFmpeg is lower than the default converter, low speed and high CPU usage. But in Chrome, the performance of FFmpeg is better than the default converter, the CPU usage is low, and the speed of converting is similar. But when you use FFmpeg, the progress notification is completely wrong, I don't have any clues about this problem for now.

Therefore, you can compare these 2 converters and choose the one you like.
