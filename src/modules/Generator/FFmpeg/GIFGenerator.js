import Generator from "@/modules/Generator/FFmpeg/Generator";

class GIFGenerator extends Generator {
  writeDurationsInput() {
    let content = "";

    this.frames.forEach(frame => {
      content += `file '${frame.file}'` + "\r\n";
      content += `duration ${frame.delay / 1000}` + "\r\n";
    });

    this.ffmpeg.FS('writeFile', 'input.txt', content);
  }

  generate() {
    this.init().then(() => {
      return this.loadFrames();
    }).then(() => {
      this.writeDurationsInput();

      return this.runFFmpeg('-f', 'concat', '-i', 'input.txt', '-plays', 0, 'out.gif');
    }).then(() => {
      let data = this.ffmpeg.FS('readFile', 'out.gif');

      this.dispatch('finish', [new Blob([data], { type: 'image/gif' })]);

      this.loadedFiles.forEach(file => this.ffmpeg.FS('unlink', file));
      this.ffmpeg.FS('unlink', 'out.gif');
      this.ffmpeg.FS('unlink', 'input.txt');
    }).finally(() => {
      this.destroy();
    });
  }
}

export default GIFGenerator;
