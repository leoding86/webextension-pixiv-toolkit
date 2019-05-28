<template>
    <v-container style="max-width: 640px;">
        <!-- <span class="card-title">{{ tl('general') }}</span>
        <v-card style="margin-bottom:30px;">
            <v-list one-line>
                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-title>Enable Extension</v-list-tile-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-switch v-model="enableExtension"></v-switch>
                    </v-list-tile-action>
                </v-list-tile>
            </v-list>
        </v-card> -->
        <supports></supports>
        <span class="card-title">{{ tl('Ugoira') }}</span>
        <v-card style="margin-bottom:30px;">
            <v-list two-line>
                <v-list-tile @click="showRenameUgoiraDialog()">
                    <v-list-tile-content>
                        <v-list-tile-title>{{ tl('rename_ugoira_file') }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ ugoiraRenameFormatPreview }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-btn icon ripple>
                            <v-icon>keyboard_arrow_right</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ tl('quality') }}</v-list-tile-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-select :items="quanlityItems"
                                  v-model="ugoiraQuanlity"
                                  type="value" @change="onUgoiraQuanlityChangeHandler"
                                  style="width:150px;"></v-select>
                    </v-list-tile-action>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ tl('pack_ugoira_frames_info') }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ tl('pack_ugoira_frames_info_into_zip') }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-switch v-model="enablePackUgoiraFramesInfo"
                            @change="onEnablePackUgoiraFramesInfoChangedHandler"></v-switch>
                    </v-list-tile-action>
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title>
                      {{ tl('setting_generate_and_download') }}
                    </v-list-tile-title>
                    <v-list-tile-sub-title>
                      {{ tl('setting_generate_and_download_desc') }}
                    </v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-switch v-model="ugoiraGenerateAndDownload"></v-switch>
                  </v-list-tile-action>
                </v-list-tile>
                <v-list-tile @click="showUgoiraExtendDialog()">
                    <v-list-tile-content>
                        <v-list-tile-title>{{ tl('extend_duration') }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ tl('extend_duration_desc') }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-btn icon ripple>
                            <v-icon>keyboard_arrow_right</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>
            </v-list>
        </v-card>
        <span class="card-title">{{ tl('Manga') }}</span>
        <v-card style="margin-bottom:30px;">
            <v-list two-line>
                <v-list-tile @click="showRenameMangaDialog()">
                    <v-list-tile-content>
                        <v-list-tile-title>{{ tl('rename_manga') }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ mangaRenameFormatPreview }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-btn icon ripple>
                            <v-icon>keyboard_arrow_right</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>
                <v-list-tile @click="showRenameMangaImageDialog()">
                    <v-list-tile-content>
                        <v-list-tile-title>{{ tl('rename_manga_image') }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ mangaImageRenameFormatPreview }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-btn icon ripple>
                            <v-icon>keyboard_arrow_right</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>

                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title>
                      {{ tl('setting_pack_and_download') }}
                    </v-list-tile-title>
                    <v-list-tile-sub-title>
                      {{ tl('setting_pack_and_download_desc') }}
                    </v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-switch v-model="mangaPackAndDownload"></v-switch>
                  </v-list-tile-action>
                </v-list-tile>

                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ tl('number_of_pages_in_each_chunk') }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ tl('number_of_pages_in_each_chunk_desc') }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-text-field reverse v-model="mangaPagesInChunk"
                            @change="mangaPagesInChunkChanged" type="number"
                            style="width:100px;"></v-text-field>
                    </v-list-tile-action>
                </v-list-tile>
            </v-list>
        </v-card>

        <span class="card-title">{{ tl('Downloads') }}</span>

        <v-card style="margin-bottom:30px;">
            <v-list two-line>
                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ tl('setting_downloads_permission') }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ tl('setting_downloads_permission_desc') }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-btn @click="switchDownloadsPermission">{{ downloadPermissionText }}</v-btn>
                    </v-list-tile-action>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ tl('setting_ext_take_over_downloads') }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ tl('setting_ext_take_over_downloads_desc') }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-switch v-model="enableExtTakeOverDownloads"
                          :disabled="!hasDownloadsPermission"></v-switch>
                    </v-list-tile-action>
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ tl('setting_relative_location') }}</v-list-tile-title>
                    <v-list-tile-sub-title>{{ downloadRelativeLocation }}</v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-btn :disabled="!enableExtTakeOverDownloads"
                      @click="showDownloadRelativeLocationDialog()">{{ tl('Change') }}</v-btn>
                  </v-list-tile-action>
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title>
                      Ask where to save each file before downloading <sup class="beta-notice">*</sup>
                    </v-list-tile-title>
                    <v-list-tile-sub-title>
                      This setting has no effect if the similar setting of your Chrome is on.
                    </v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-switch v-model="downloadSaveAs"
                      :disabled="!hasDownloadsPermission || !enableExtTakeOverDownloads"></v-switch>
                  </v-list-tile-action>
                </v-list-tile>
            </v-list>
        </v-card>

        <span class="card-title">{{ tl('Others') }}</span>

        <v-card>
          <v-list two-line>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>{{ tl('setting_show_history_when_update_completed') }}</v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-switch v-model="showHistoryWhenUpdateCompleted"></v-switch>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-card>

        <router-view />
    </v-container>
</template>

<script>
import '@/assets/global.scss'
import common from '@/modules/common';
import cr from '@/modules/cr'
import Supports from '@/components/Supports';

export default {
    name: 'Options',

    components: {
      supports: Supports
    },

    data () {
        return {
            quanlityItems: [
                {
                    text: cr._e('ugoira_normal'),
                    value: 10
                }, {
                    text: cr._e('ugoira_good'),
                    value: 5
                }, {
                    text: cr._e('ugoira_best'),
                    value: 1
                }
            ],
            ugoiraQuanlity: 10,
            ugoiraRenameFormat: '',
            mangaRenameFormat: '',
            mangaImageRenameFormat: '',
            enableExtension: true,
            enablePackUgoiraFramesInfo: true,
            mangaPagesInChunk: 99,

            ugoiraGenerateAndDownload: false,

            mangaPackAndDownload: false,

            isChrome: false,

            hasDownloadsPermission: false,

            enableExtTakeOverDownloads: false,

            downloadRelativeLocation: null,

            showHistoryWhenUpdateCompleted: true,

            downloadSaveAs: false,

            browser: chrome
        }
    },

    mounted () {
        var self = this;

        cr._s.get(null).then(function(items) {
            self.ugoiraQuanlity = items.ugoiraQuanlity ? items.ugoiraQuanlity : self.ugoiraQuanlity;
            self.ugoiraRenameFormat = items.ugoiraRenameFormat ? items.ugoiraRenameFormat : '';
            self.mangaRenameFormat = items.mangaRenameFormat ? items.mangaRenameFormat : '';
            self.mangaImageRenameFormat = items.mangaImageRenameFormat ? items.mangaImageRenameFormat : '';
            self.enableExtension = items.enableExtension ? items.enableExtension : '';
            self.enablePackUgoiraFramesInfo = !!items.enablePackUgoiraFramesInfo;
            self.mangaPagesInChunk = items.mangaPagesInChunk;
            self.ugoiraGenerateAndDownload = items.ugoiraGenerateAndDownload;
            self.mangaPackAndDownload = items.mangaPackAndDownload;

            self.enableExtTakeOverDownloads = !!items.enableExtTakeOverDownloads;

            self.downloadRelativeLocation = items.downloadRelativeLocation;

            self.showHistoryWhenUpdateCompleted = !!items.showHistoryWhenUpdateCompleted;

            self.downloadSaveAs = !!items.downloadSaveAs;
        });

        cr._s.onChanged.addListener(self.onStorageChanged);

        this.browser.permissions.contains({
          permissions: ['downloads']
        }, function (result) {
          self.hasDownloadsPermission = result;
        });
    },

    beforeRouteUpdate (to, from, next) {
        var self = this;

        if (from.name === 'RenameManga') {
            cr._s.get('mangaRenameFormat').then((items) => {
                self.mangaRenameFormat = items.mangaRenameFormat;
            });
        } else if (from.name === 'RenameMangaImage') {
            cr._s.get('mangaImageRenameFormat').then((items) => {
                self.mangaImageRenameFormat = items.mangaImageRenameFormat;
            });
        } else if (from.name === 'RenameUgoira') {
            cr._s.get('ugoiraRenameFormat').then((items) => {
                self.ugoiraRenameFormat = items.ugoiraRenameFormat
            });
        }

        next();
    },

    beforeRouteLeave (to, from, next) {
      cr._s.onChanged.removeListener(this.onStorageChanged);

      next();
    },

    computed: {
        ugoiraRenameFormatPreview () {
            if (!!this.ugoiraRenameFormat) {
                return this.ugoiraRenameFormat;
            } else {
                return 'Not set';
            }
        },

        mangaRenameFormatPreview () {
            if (!!this.mangaRenameFormat) {
                return this.mangaRenameFormat;
            } else {
                return 'Not set';
            }
        },

        mangaImageRenameFormatPreview() {
            if (!!this.mangaImageRenameFormat) {
                return this.mangaImageRenameFormat;
            } else {
                return 'Not set';
            }
        },

        downloadPermissionText () {
            if (this.hasDownloadsPermission) {
                return this.tl('Remove');
            } else {
                return this.tl('Grant');
            }
        }
    },

    watch: {
        enableExtension: function (val) {
          cr._s.set({
              enableExtension: val
          }).then(() => {
              window.cr.storage.items.enableExtend = val;
          });
        },

        ugoiraGenerateAndDownload (val) {
          cr._s.set({
            ugoiraGenerateAndDownload: val
          }).then(() => {
            window.cr.storage.items.ugoiraGenerateAndDownload = val;
          });
        },

        mangaPackAndDownload (val) {
          cr._s.set({
            mangaPackAndDownload: val
          }).then(() => {
            window.cr.storage.items.mangaPackAndDownload = val;
          });
        },

        enableExtTakeOverDownloads (val) {
          cr._s.set({
            enableExtTakeOverDownloads: val
          });
        },

        showHistoryWhenUpdateCompleted (val) {
          cr._s.set({
            showHistoryWhenUpdateCompleted: val
          });
        },

        downloadSaveAs (val) {
          cr._s.set({
            downloadSaveAs: val
          });
        }
    },

    methods: {
        tileClickHandler: function (evt) {
            // console.log(1);
        },

        showRenameUgoiraDialog: function (evt) {
            this.$router.push({
                name: 'RenameUgoira',
                params: {
                    renameFormat: this.ugoiraRenameFormat
                }
            })
        },

        showRenameMangaDialog: function (evt) {
            this.$router.push({
                name: 'RenameManga',
                params: {
                    renameFormat: this.mangaRenameFormat
                }
            });
        },

        showRenameMangaImageDialog: function (evt) {
            this.$router.push({
                name: 'RenameMangaImage',
                params: {
                    renameFormat: this.mangaImageRenameFormat
                }
            });
        },

        showUgoiraExtendDialog: function (evt) {
            this.$router.push('ugoira-extend')
        },

        onUgoiraQuanlityChangeHandler: function () {
            let _this = this
            cr._s.set({ 'ugoiraQuanlity': _this.ugoiraQuanlity } )
        },

        onEnablePackUgoiraFramesInfoChangedHandler: function () {
            let _this = this;
            cr._s.set({ 'enablePackUgoiraFramesInfo': this.enablePackUgoiraFramesInfo });
        },

        mangaPagesInChunkChanged: function () {
            let _this = this;

            if (!this.mangaPagesInChunk.match(/^[1-9]\d*$/)) {
                alert('Please input number greater then 1');
                return;
            }

            cr._s.set({ mangaPagesInChunk: parseInt(this.mangaPagesInChunk) });
        },

        showDownloadRelativeLocationDialog: function () {
          this.$router.push({
            name: 'DownloadRelativeLocationDialog',
            params: {
              downloadRelativeLocation: ''
            }
          })
        },

        onStorageChanged: function (changes, areaName) {
          let updatedIndex = [
            'downloadRelativeLocation',
            'downloadSaveAs'
          ];

          for (let i in changes) {
            if (updatedIndex.indexOf(i) > -1) {
              this[i] = changes[i].newValue;
            }
          }
        },

        switchDownloadsPermission: function () {
          let vm = this;

          this.browser.permissions.contains({
            permissions: ['downloads']
          }, function (result) {
            if (result) {
              vm.browser.permissions.remove({
                permissions: ['downloads']
              }, function (removed) {
                vm.hasDownloadsPermission = vm.enableExtTakeOverDownloads = !removed;
              });
            } else {
              vm.browser.permissions.request({
                permissions: ['downloads']
              }, function (granted) {
                vm.hasDownloadsPermission = !!granted;
              });
            }
          });
        },

        tl (string) {
            return cr._e(string);
        }
    }
}
</script>

<style lang="scss" scoped>
#app {
    .card-title {
        display: block;
        font-size: 18px;
        margin-bottom: 10px;
    }
}
</style>
