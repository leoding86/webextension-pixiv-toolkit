import Generator from "@/modules/Generator/FFmpeg/Generator";

class APNGGenerator extends Generator {
  generate() {
    return new Promise(resolve => {
      this.loadFrames().then(() => {
        return this.runFFmpeg('-r', this.frameRate, '-i', '%06d.jpg', '-plays', 0, 'out.apng');
      }).then(() => {
        let data = this.ffmpeg.FS('readFile', 'out.apng');

        this.dispatch('finish', [new Blob([data], { type: 'image/gif' })]);

        this.loadedFiles.forEach(file => this.ffmpeg.FS('unlink', file));
        this.ffmpeg.FS('unlink', 'out.apng');

        resolve();
      });
    });
  }
}

export default APNGGenerator;
