<template>
  <div v-if="show">
    <ptk-button
      v-for="buttonInfo in buttonsInfo"
      :key="buttonInfo.index"
      :text="buttonInfo.text"
      :type="buttonInfo.type"
      @click="downloadButtonClicked(buttonInfo)"
    ></ptk-button>
  </div>
</template>

<script>
import Button from '@/content_scripts/components/Button'
import formatName from '@/modules/Util/formatName'
import downloadFileMixin from '@/content_scripts/mixins/downloadFileMixin'
import IllustTool from '@/content_scripts/illust/Illust'
import DownloadManager from '@/modules/Manager/DownloadManager'

export default {
  mixins: [
    downloadFileMixin
  ],

  components: {
    'ptk-button': Button
  },

  props: {
    tool: IllustTool,
  },

  data() {
    return {
      illustTool: null,
      show: false,
      chunks: [],
      buttonsInfo: {},
      isSaved: false,
      forceDownload: false
    }
  },

  mounted() {
    let vm = this,
        buttonsInfo = {}

    /**
     * @var {IllustTool}
     */
    this.illustTool = this.tool

    this.illustTool.initOptions({
      splitSize: 999,
      illustrationRenameFormat: this.browserItems.illustrationRenameFormat,
      illustrationImageRenameFormat: this.browserItems.illustrationImageRenameFormat,
      pageNumberStartWithOne: this.browserItems.illustrationPageNumberStartWithOne
    }).init()

    this.chunks = this.illustTool.chunks

    this.initDownloadButtons()

    browser.runtime.onConnect.addListener(this.handleConnect);

    this.show = true
  },

  unmounted() {
    browser.runtime.onConnect.removeListener(this.handleConnect)
  },

  watch: {
    isSaved(val) {
      Object.keys(this.buttonsInfo).forEach(key => {
        let buttonInfo = this.buttonsInfo[key];

        if (val === true && buttonInfo.text.indexOf(' ✔️') < 0) {
          this.updateButtonInfo(buttonInfo, { text: buttonInfo.text + ' ✔️' });
        } else if (val === false && buttonInfo.text.indexOf(' ✔️') > -1) {
          this.updateButtonInfo(buttonInfo, { text: buttonInfo.text.replace(' ✔️', '')});
        }
      });
    }
  },

  methods: {
    initDownloadButtons() {
			/**
			 * @param {this}
			 */
			let vm = this,
          buttonsInfo = {}

      DownloadManager.getRecord(this.illustTool.getId(), DownloadManager.illustType).then(doc => {
        this.isSaved = true;
      }).finally(() => {
        vm.chunks.forEach((chunk, i) => {
          let isSingle = vm.illustTool.isSingle()

          buttonsInfo[i] = {
            index: i,
            text: (isSingle ? 'DL image' : vm.getChunkTitle(chunk)) + (vm.isSaved ? ' ✔️' : ''),
            filename: vm.illustTool.getFilename(chunk),
            downloadStatus: 0,
            chunk: chunk,
            isSingle: isSingle,
            type: ''
          }
        })

        vm.buttonsInfo = buttonsInfo
      });
		},

    saveDownloadRecord(record) {
      this.isSaved = true;

      DownloadManager.saveRecord(this.illustTool.getId(), DownloadManager.illustType, record);
    },

    allowDownload(isSaved) {
      if (isSaved && this.browserItems.askDownloadSavedWork && !this.forceDownload) {
        if (window.confirm(this.tl('_this_work_may_has_been_saved'))) {
          this.forceDownload = true;
        } else {
          return false;
        }
      }

      return true;
    },

		updateButtonInfo(buttonInfo, data) {
			this.$set(
				this.buttonsInfo,
				buttonInfo.index,
				Object.assign(buttonInfo, data)
			)
		},

    getChunkTitle(chunk) {
      return 'DL images ' + (chunk.start - 0 + 1) + '-' + (chunk.end - 0 + 1);
    },

    downloadButtonClicked(buttonInfo) {
      let vm = this

      if (!this.allowDownload(this.isSaved)) {
        return;
      }

			if (buttonInfo.downloadStatus === 0) {
        buttonInfo.downloadStatus = 1

				// If download single illust
				if (buttonInfo.isSingle) {
					let url = this.illustTool.context.pages[0].urls.original

					this.illustTool.downloadFile(url, {
						onProgress(evt) {
							vm.updateButtonInfo(buttonInfo, {
								text: 'DL ' + Math.floor(evt.loaded * 100 / evt.total) + '%'
							});
            },

            onRename({renameFormat, context, pageNum, extName}) {
              if (!vm.browserItems.illustrationKeepPageNumber) {
                renameFormat = renameFormat.replace(/[_-\s]*{pageNum}/, '');
              }

              return formatName(renameFormat, context, context.illustId) + `.${extName}`;
            }
					}).then(result => {
						let url = URL.createObjectURL(result.blob);
						let filename = result.targetName;

						vm.updateButtonInfo(buttonInfo, {
							url: url,
							text: 'Save image',
							filename: filename,
              downloadStatus: 2
						});

            if (vm.browserItems.illustrationDownloadIfReady) {
              vm.downloadFile(url, filename, {
                statType: 'illust',
              });

              this.updateButtonInfo(buttonInfo, {
                type: 'success'
              });

              this.saveDownloadRecord({ illust: 1 });
            }
					})
				} else {
					this.illustTool.downloadChunk(buttonInfo.chunk, {
						onItemComplete: this.updateProgress(buttonInfo),
						onItemFail: this.updateProgress(buttonInfo),
						onDone: this.onDone(buttonInfo)
					})
				}
      } else if (buttonInfo.downloadStatus === 2) {
        this.updateButtonInfo(buttonInfo, {
          type: 'success'
        });

        this.downloadFile(buttonInfo.url, buttonInfo.filename, {
          statType: 'illust',
        });

        this.saveDownloadRecord({ illust: 1 });
      }
    },

    updateProgress(buttonInfo) {
      let vm = this

      return queue => {
        let text = 'C:' + queue.complete + ' / F:' + queue.fail + ' / T:' + queue.total

        vm.$set(
          vm.buttonsInfo,
          buttonInfo.index,
          Object.assign(buttonInfo, {
            text: text
          })
        )
      }
    },

    onDone(buttonInfo) {
      let vm = this

      return blob => {
        let text = 'Save images ' + (buttonInfo.chunk.start - 0 + 1) + '-' + (buttonInfo.chunk.end - 0 + 1);

        vm.$set(
          vm.buttonsInfo,
          buttonInfo.index,
          Object.assign(buttonInfo, {
            text: text,
            url: URL.createObjectURL(blob),
            downloadStatus: 2
          })
        );

        if (vm.browserItems.illustrationDownloadIfReady) {
          this.updateButtonInfo(buttonInfo, {
            type: 'success'
          });

          vm.downloadFile(buttonInfo.url, vm.getFilename(buttonInfo.chunk), {
            statType: 'illust',
          });

          this.saveDownloadRecord({ illust: 1 });
        }
      }
    },

    getFilename(chunk) {
      return formatName(this.browserItems.illustrationRenameFormat, this.illustTool.context, this.illustTool.context.illustId) + '_' + chunk.start + '-' + chunk.end + '.zip'
    },

    handleConnect(port) {
      let self = this;

      if (port.name === 'popup') {
        port.onMessage.addListener((message, sender, sendResponse) => {
          if (message.type === 'fetch-info') {
            port.postMessage({
              info: self.illustTool.context
            })
          }
        })
      }
    }
  }
}
</script>
