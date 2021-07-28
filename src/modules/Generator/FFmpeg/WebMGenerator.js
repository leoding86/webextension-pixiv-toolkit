import Generator from "@/modules/Generator/FFmpeg/Generator";

class WebMGenerator extends Generator {
  generate() {
    this.init().then(() => {
      return this.loadFrames()
    }).then(() => {
      return this.runFFmpeg('-r', this.frameRate, '-i', '%06d.jpg', '-c:v', 'libvpx', '-b:v', '2500k', 'out.webm');
    }).then(() => {
      let data = this.ffmpeg.FS('readFile', 'out.webm');

      this.dispatch('finish', [new Blob([data], { type: 'video/webm' })]);

      this.loadedFiles.forEach(file => this.ffmpeg.FS('unlink', file));
      this.ffmpeg.FS('unlink', 'out.webm');
    }).finally(() => {
      this.destroy();
    });
  }
}

export default WebMGenerator;
