import Generator from "@/modules/Generator/FFmpeg/Generator";

class WebMGenerator extends Generator {
  generate() {
    return new Promise(resolve => {
      this.loadFrames().then(() => {
        return this.runFFmpeg('-r', this.frameRate, '-i', '%06d.jpg', 'out.webm');
      }).then(() => {
        let data = this.ffmpeg.FS('readFile', 'out.webm');

        this.dispatch('finish', [new Blob([data], { type: 'image/gif' })]);

        this.loadedFiles.forEach(file => this.ffmpeg.FS('unlink', file));
        this.ffmpeg.FS('unlink', 'out.webm');

        resolve();
      });
    });
  }
}

export default WebMGenerator;
