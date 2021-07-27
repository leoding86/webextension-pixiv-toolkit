import Generator from "@/modules/Generator/FFmpeg/Generator";

class GIFGenerator extends Generator {
  generate() {
    return new Promise(resolve => {
      this.loadFrames().then(() => {
        return this.runFFmpeg('-r', this.frameRate, '-i', '%06d.jpg', '-plays', 0, 'out.gif');
      }).then(() => {
        let data = this.ffmpeg.FS('readFile', 'out.gif');

        this.dispatch('finish', [new Blob([data], { type: 'image/gif' })]);

        this.loadedFiles.forEach(file => this.ffmpeg.FS('unlink', file));
        this.ffmpeg.FS('unlink', 'out.gif');

        resolve();
      });
    });
  }
}

export default GIFGenerator;
