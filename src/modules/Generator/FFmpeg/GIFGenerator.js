import Generator from "@/modules/Generator/FFmpeg/Generator";

class GIFGenerator extends Generator {
  generate() {
    this.init().then(() => {
      return this.loadFrames();
    }).then(() => {
      return this.runFFmpeg('-r', this.frameRate, '-i', '%06d.jpg', '-plays', 0, 'out.gif');
    }).then(() => {
      let data = this.ffmpeg.FS('readFile', 'out.gif');

      this.dispatch('finish', [new Blob([data], { type: 'image/gif' })]);

      this.loadedFiles.forEach(file => this.ffmpeg.FS('unlink', file));
      this.ffmpeg.FS('unlink', 'out.gif');
    }).finally(() => {
      this.destroy();
    });
  }
}

export default GIFGenerator;
