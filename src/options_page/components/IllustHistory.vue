<template>
  <div class="container container--big">
    <v-alert
      :value="true"
      type="warning"
      v-if="!enableSaveVisitHistory">{{ tl('_save_visit_history_has_been_disabled') }}</v-alert>

    <!-- Searchbar -->
    <v-text-field class="search-panel"
      label="Solo"
      single-line
      solo
      flat
      :placeholder="tl('_search_history')"
      v-model="searchQuery"
    ></v-text-field>
    <!-- /Searchbar -->

    <div class="dataset-head-actions-wrap">
      <v-btn
        class="text-none"
        style="margin-left:0;"
        flat
        @click="pushRoute({name: 'VisitHistory'})"
      >{{ tl('_go_to_new_style') }}</v-btn>

      <v-btn
        class="text-none"
        style="margin-left:0;"
        depressed
        flat>{{ tl('_total_records') }} {{ total }}</v-btn>

      <v-switch v-model="disableBlurOnR" :label="tl('_disable_mask')"></v-switch>

      <!-- <v-btn @click="insertData">Insert 10w</v-btn> -->
    </div>

    <v-layout row wrap
      class="illust-history-wrap">
      <p v-if="illusts.length <= 0"
        style="font-size:14px;text-align:center;">
        {{ tl('_there_is_no_any_history') }}
      </p>
      <v-flex v-else lg1 md2 sm3 xs4 v-for="(illust, i) in illusts" :key="i">
        <v-card class="card--history-item">
          <div class="card--image-wrap">
            <div v-if="illust.r && !disableBlurOnR" class="card--image__mask"></div>
            <!-- <div class="card--image" :style="{paddingBottom: '117%', backgroundImage: 'url(' + illust.images.thumb + ')'}"></div> -->
            <cacheable-image class="card--image"
              :src="illust.isNovel ? illust.image : illust.images.thumb"
              mode="background">
            </cacheable-image>
          </div>
          <div class="card--history-info">{{ illust.title }}</div>
          <div class="card--type">{{ readableType(illust) }}</div>
          <div class="card--r" v-if="!!illust.r">R</div>
          <v-card-actions class="card--actions-wrap">
            <v-btn outline small icon color="red"
              @click="deleteOne(illust)">
              <v-icon small>delete_outline</v-icon>
            </v-btn>
            <v-btn outline small icon
              @click="openInNew(illust)">
              <v-icon small>open_in_new</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>

    <div style="text-align:center;clear:both;" v-if="loading">
      <v-progress-circular
        indeterminate
        color="primary"
      ></v-progress-circular>
    </div>

    <div style="margin:20px 0;" v-if="!loading && !importing && !exporting && illusts.length > 0">
      <v-btn depressed
        color="#eee"
        @click="prev()"
        style="margin-left:0">{{ tl('_newer') }}</v-btn>
      <v-btn
        depressed
        color="#eee"
        @click="next()">{{ tl('_older') }}</v-btn>
      <v-menu open-on-hover top offset-y>
        <template v-slot:activator="{ on }">
          <v-btn
            depressed
            color="#eee"
            v-on="on">
            {{ tl('_page') }} {{ page }}
          </v-btn>
        </template>

        <v-list>
          <v-list-tile v-for="page in pages" :key="page" style="background: #fff"
            @click="changePage(page)">
            <v-list-tile-title>{{ page }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </div>

    <v-dialog v-model="confirmDialog"
      width="500">
      <v-card>
        <v-card-title>{{ tl('_notice') }}</v-card-title>
        <v-card-text>
          <p style="font-size:14px;">{{ tl('_this_operation_cannot_be_reversed_are_you_sure') }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteIllust"
            color="error">{{ tl('_delete') }}</v-btn>
          <v-btn @click="confirmDialog = false">{{ tl('_keep') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import PageTitle from '@@/components/PageTitle'
import IllustHistory from '@/repositories/IllustHistory'
import CacheableImage from '@@/components/CacheableImage';
import Supports from '@@/components/Supports';
import SuperMixin from '@/mixins/SuperMixin';
import IllustHistoryPort from '@/modules/Ports/IllustHistoryPort/RendererPort';

export default {
  mixins: [
    SuperMixin,
  ],

  components: {
    'page-title': PageTitle,
    'cacheable-image': CacheableImage
  },

  data() {
    return {
      total: 0,
      illusts: [],
      page: 0,
      step: 36,
      disableBlurOnR: false,
      landscape: false,
      loading: false,
      confirmDialog: false,
      illustDeleteReady: null,
      pages: 0,
      searchQuery: '',
      searchTimeout: null,
      enableSaveVisitHistory: true
    };
  },

  beforeMount() {
    /**
     * Store visit history type
     */
    browser.storage.local.set({
      visitHistoryType: 'grid'
    });

    let vm = this;

    this.loading = true;
    this.illustHistory = new IllustHistory();

    this.illustHistoryPort = IllustHistoryPort.getInstance();

    /**
     * Init some data
     */
    this.enableSaveVisitHistory = this.browserItems.enableSaveVisitHistory;

    this.illustHistory.init().then(() => {
      vm.illustHistory.db.allDocs({
        endkey: '_'
      }).then(items => {
        vm.total = items.rows.length
        vm.pages = Math.floor(vm.total / vm.step) + 1
      })

      vm.page = 1
    })
  },

  computed: {
    imageAspectRatio() {
      if (this.landscape) {
        return 1.5
      } else {
        return 0.85
      }
    },

    importProgress() {
      if (this.importTotal === 0) {
        return ''
      }

      return ' (' + this.importedCount + '/' + this.importTotal + ')'
    }
  },

  watch: {
    page(val) {
      if (this.searchQuery.trim().length === 0) {
        this.getIllusts();
      } else {
        this.searchIllusts();
      }
    },

    searchQuery(val) {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.searchTimeout = setTimeout(() => {
        if (this.page == 1) {
          if (val.trim().length === 0) {
            this.getIllusts();
          } else {
            this.searchIllusts();
          }

          return;
        }

        this.page = 1;
      }, 800);
    }
  },

  methods: {
    readableType(illust) {
      if (illust.isNovel) {
        return 'N';
      }

      if (illust.type == 1) {
        return "M";
      } else if (illust.type == 2) {
        return "A";
      } else if (illust.type == 0) {
        return "I";
      }
    },

    openInNew(illust) {
      let url = '';

      if (illust.isNovel) {
        url = 'https://www.pixiv.net/novel/show.php?id=' + illust.id.substr(1);
      } else {
        url = 'https://www.pixiv.net/member_illust.php?mode=medium&illust_id=' + illust.id;
      }
      window.open(url)
    },

    deleteOne(illust) {
      this.confirmDialog = true;

      /**
       * Cache item ready to delete
       */
      this.illustDeleteReady = illust;
    },

    deleteIllust() {
      this.confirmDialog = false

      this.illustHistoryPort.deleteIllustHistory(this.illustDeleteReady);
      this.illusts.splice(this.illusts.indexOf(this.illustDeleteReady), 1);
      this.total--;

      // let vm = this

      // this.illustHistory.deleteIllust(this.illustDeleteReady).then(() => {
      //   vm.illusts.splice(vm.illusts.indexOf(this.illustDeleteReady), 1)
      //   vm.total--
      // })
    },

    /**
     * Get illust histories
     */
    getIllusts() {
      this.loading = true

      this.illustHistory.getIllusts({
        limit: this.step,
        skip: (this.page - 1) * this.step
      }).then(illusts => {
        this.loading = false

        if (!illusts || illusts.length < 1) {
          return
        }

        this.illusts = illusts
      }).catch(err => {
        console.log(err);
      });
    },

    /**
     * Search illust histories
     */
    searchIllusts() {
      let vm = this;

      this.illustHistory.searchIllusts({
        limit: this.step,
        skip: (this.page - 1) * this.step,
        fun(doc, emit) {
          if (doc.title.indexOf(vm.searchQuery) > -1) {
            emit(doc);
          }
        }
      }).then(illusts => {
        this.loading = false;

        if (!illusts || illusts.length < 1) {
          this.illusts = [];
        } else {
          this.illusts = illusts;
        }
      }).catch(err => {
        console.log(err);
      });
    },

    changePage(page) {
      this.page = page
    },

    prev() {
      if (this.page <= 1) {
        alert('There is no newer')
        return
      }

      this.page--
    },

    next() {
      if (this.page >= this.pages) {
        alert('There is no older')
        return
      }

      this.page++
    },

    insertData() {
      let startId = 70114228
      let endId = startId + 10000

      this.putExampleData(startId, endId).then(() => {
        console.log('complete')
      }).catch(() => {
        console.log('error')
      })
    },

    putExampleData(startId, endId) {
      let vm = this

      let root = 'https://www.pixiv.net/ajax/illust/'

      let url = root + startId

      console.log('request ' + url)

      return new Promise(resolve => {
        let xhr = new XMLHttpRequest()
        xhr.open('get', url)
        xhr.addEventListener('loadend', () => {
          let data

          try {
            data = JSON.parse(xhr.responseText)

            if (data.error === false && data.body) {
              vm.illustHistory.putIllust({
                id: data.body.illustId,
                title: data.body.illustTitle,
                images: data.body.urls,
                type: data.body.illustType,
                viewed_at: Math.floor(Date.now()),
                r: data.body.xRestrict === 0 ? false : true
              })
            }
          } catch (e) {
            //do nothing
          }

          startId++

          if (startId > endId) {
            resolve()
          } else {
            resolve(vm.putExampleData(startId, endId))
          }
        })
        xhr.send()
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.dataset-head-actions-wrap {
  .v-input--selection-controls {
    display: inline-block;
    box-sizing: border-box;
    margin-top: 5px;
    padding-top: 0px;
    height: 36px;
    position: relative;
    top: 4px;
    left: 10px;
  }
}

.search-panel {
  margin: 10px 0;
}

.illust-history-wrap {
  margin-top: 20px;
}

.card--history-item {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 0;
  box-shadow: none;

  .card--actions-wrap {
    display: none;
    position: absolute;
    width: 100%;
    height: 50px;
    bottom: 0;
    right: 0;
    text-align: center;
    background: rgba(255, 255, 255, 0.8);
  }

  &:hover {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    z-index: 99;

    .card--actions-wrap {
      display: block;
    }
  }

  // &:hover {
  //   z-index: 9;
  // }

  // &:hover .card--type,
  // &:hover .card--r {
  //   width: 30px;
  //   height: 30px;
  //   line-height: 30px;
  //   font-size: 16px;
  // }

  .card--history-info {
    font-size: 14px;
    height: 50px;
    line-height: 25px;
    padding: 0 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    // white-space: nowrap;
  }

  .card--type {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 20px;
    height: 20px;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    transition: all 0.2s;
    z-index: 2;
  }

  .card--r {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    color: #fff;
    background: rgba(255, 0, 0, 0.8);
    transition: all 0.2s;
    z-index: 2;
  }

  .card--image-wrap {
    position: relative;
    overflow: hidden;
  }

  .card--image__mask {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: url(../assets/mask.gif) repeat;
    z-index: 1;
    opacity: 1;
    transition: opacity 0.7s
  }

  .card--image {
    background-size: cover;
    background-position: center center;
    padding-top: 117%;
  }

  &:hover .card--image__mask {
    opacity: 0;
  }
}
</style>
