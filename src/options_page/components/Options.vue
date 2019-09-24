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

        <search-options></search-options>

        <other-options></other-options>

        <router-view />
    </v-container>
</template>

<script>
import '@@/assets/global.scss'
import '@/mixins/SuperMixin';
import Supports from '@@/components/Supports';
import SearchOptions from '@@/components/options/SearchOptions';
import OtherOptions from '@@/components/options/OtherOptions';
import SuperMixin from '@/mixins/SuperMixin';

export default {
    name: 'Options',

    mixins: [
      SuperMixin
    ],

    components: {
      supports: Supports,
      'search-options': SearchOptions,
      'other-options': OtherOptions
    },

    data () {
        return {
            quanlityItems: [
                {
                    text: this.tl('ugoira_normal'),
                    value: 10
                }, {
                    text: this.tl('ugoira_good'),
                    value: 5
                }, {
                    text: this.tl('ugoira_best'),
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

            downloadSaveAs: false
        }
    },

    beforeMount () {
        var self = this;

        this.ugoiraQuanlity = this.browserItems.ugoiraQuanlity || 10;
        this.ugoiraRenameFormat = this.browserItems.ugoiraRenameFormat;
        this.mangaRenameFormat = this.browserItems.mangaRenameFormat;
        this.mangaImageRenameFormat = this.browserItems.mangaImageRenameFormat;
        this.enableExtension = this.browserItems.enableExtension;
        this.enablePackUgoiraFramesInfo = !!this.browserItems.enablePackUgoiraFramesInfo;
        this.mangaPagesInChunk = this.browserItems.mangaPagesInChunk;
        this.ugoiraGenerateAndDownload = this.browserItems.ugoiraGenerateAndDownload;
        this.mangaPackAndDownload = this.browserItems.mangaPackAndDownload;

        this.enableExtTakeOverDownloads = !!this.browserItems.enableExtTakeOverDownloads;

        this.downloadRelativeLocation = this.browserItems.downloadRelativeLocation;

        this.downloadSaveAs = !!this.browserItems.downloadSaveAs;

        browser.permissions.contains({
          permissions: ['downloads']
        }, function (result) {
          this.hasDownloadsPermission = result;
        });
    },

    beforeRouteLeave (to, from, next) {
      browser.storage.onChanged.removeListener(this.onStorageChanged);

      next();
    },

    computed: {
        ugoiraRenameFormatPreview () {
            if (!!this.browserItems.ugoiraRenameFormat) {
                return this.browserItems.ugoiraRenameFormat;
            } else {
                return 'Not set';
            }
        },

        mangaRenameFormatPreview () {
            if (!!this.browserItems.mangaRenameFormat) {
                return this.browserItems.mangaRenameFormat;
            } else {
                return 'Not set';
            }
        },

        mangaImageRenameFormatPreview() {
            if (!!this.browserItems.mangaImageRenameFormat) {
                return this.browserItems.mangaImageRenameFormat;
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
          browser.storage.local.set({
              enableExtension: val
          });
        },

        ugoiraGenerateAndDownload (val) {
          browser.storage.local.set({
            ugoiraGenerateAndDownload: val
          });
        },

        mangaPackAndDownload (val) {
          browser.storage.local.set({
            mangaPackAndDownload: val
          });
        },

        enableExtTakeOverDownloads (val) {
          browser.storage.local.set({
            enableExtTakeOverDownloads: val
          });
        },

        downloadSaveAs (val) {
          browser.storage.local.set({
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
            browser.storage.local.set({ 'ugoiraQuanlity': _this.ugoiraQuanlity } )
        },

        onEnablePackUgoiraFramesInfoChangedHandler: function () {
            let _this = this;
            browser.storage.local.set({ 'enablePackUgoiraFramesInfo': this.enablePackUgoiraFramesInfo });
        },

        mangaPagesInChunkChanged: function () {
            let _this = this;

            if (!this.mangaPagesInChunk.match(/^[1-9]\d*$/)) {
                alert('Please input number greater then 1');
                return;
            }

            browser.storage.local.set({ mangaPagesInChunk: parseInt(this.mangaPagesInChunk) });
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

          browser.permissions.contains({
            permissions: ['downloads']
          }, function (result) {
            if (result) {
              browser.permissions.remove({
                permissions: ['downloads']
              }, function (removed) {
                vm.hasDownloadsPermission = vm.enableExtTakeOverDownloads = !removed;
              });
            } else {
              browser.permissions.request({
                permissions: ['downloads']
              }, function (granted) {
                vm.hasDownloadsPermission = !!granted;
              });
            }
          });
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

<style lang="scss">
#app {
  .option-section {
    margin: 30px 0;

    .option-card-title {
        display: block;
        font-size: 18px;
        margin-bottom: 10px;
    }
  }
}
</style>
