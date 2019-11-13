<template>
  <div class="container container--big">
    <v-alert
      :value="true"
      type="warning"
      v-if="!enableSaveVisitHistory">Save visit history has been disabled</v-alert>

    <!-- Searchbar -->
    <v-text-field class="search-panel"
      label="Solo"
      single-line
      solo
      flat
      placeholder="Search History (Beta)"
      v-model="searchQuery"
    ></v-text-field>
    <!-- /Searchbar -->

    <div class="dataset-head-actions-wrap">
      <v-btn
        class="text-none"
        style="margin-left:0;"
        depressed
        flat>Total {{ total }} Records</v-btn>

      <v-btn @click="exportIllustHistory"
        depressed
        color="#eee">
        Export
        <v-progress-circular
          indeterminate
          color="primary"
          v-if="exporting"
          size="20"
          width="3"
          style="margin-left:5px"
        ></v-progress-circular>
      </v-btn>

      <v-btn
        @click="importIllustHistory"
        depressed
        color="#eee">
        Import <span v-if="importTotal > 0">({{ importedCount }} / {{ importTotal }})</span>
        <v-progress-circular
          indeterminate
          color="primary"
          v-if="importing"
          size="20"
          width="3"
          style="margin-left:5px"
        ></v-progress-circular>
      </v-btn>

      <v-switch v-model="disableBlurOnR" label="Disable mask"></v-switch>

      <!-- <v-btn @click="insertData">Insert 10w</v-btn> -->
    </div>

    <v-layout row wrap
      class="illust-history-wrap">
      <p v-if="illusts.length <= 0"
        style="font-size:14px;text-align:center;">
        There is no any history
      </p>
      <recycle-scroller v-else
        class="scroller"
        :items="illusts"
        :item-size="90"
        page-mode
        key-field="id"
        v-slot="{ item }"
      >
        <div class="illust-content">
          <div class="illust-content__thumb-content">
            <cacheable-image class="illust-content__thumb"
              :src="item.images.thumb"
              mode="background"
            ></cacheable-image>
          </div>
          <div class="illust-content__info">
            <div class="illust-content__info-entity illust-content__info-entity--blod"><span class="illust-content__badge" :class="`illust-content__badge--type${item.type}`">{{ caseWorkType(item.type) }}</span>{{ item.title }}</div>
            <div class="illust-content__info-entity">{{ caseDate(item.viewed_at) }}</div>
            <div class="illust-content__info-entity">{{ caseWorkUrl(item.id) }}</div>
          </div>
          <div class="illust-content__actions">
            <v-menu left bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  class="illust-content__actions-btn"
                  flat
                  icon
                  v-on="on"
                >
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-tile>
                  <v-list-tile-title
                    @click="deleteOne(item)"
                  >Delete</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </div>
        </div>
      </recycle-scroller>
    </v-layout>

    <div style="text-align:center;clear:both;" v-if="loading">
      <v-progress-circular
        indeterminate
        color="primary"
      ></v-progress-circular>
    </div>

    <v-dialog v-model="confirmDialog"
      width="500">
      <v-card>
        <v-card-title>Delete confirmation</v-card-title>
        <v-card-text>
          <p style="font-size:14px;">This operation cannot be reversed, are you sure?</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteIllust"
            color="error">Delete</v-btn>
          <v-btn @click="confirmDialog = false">Keep it</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { RecycleScroller } from 'vue-virtual-scroller'
import PageTitle from '@@/components/PageTitle'
import IllustHistory from '@/repositories/IllustHistory'
import CacheableImage from '@@/components/CacheableImage';
import Supports from '@@/components/Supports';
import SuperMixin from '@/mixins/SuperMixin';

export default {
  mixins: [
    SuperMixin,
  ],

  components: {
    'page-title': PageTitle,
    'cacheable-image': CacheableImage,
    'recycle-scroller': RecycleScroller
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
      exporting: false,
      importing: false,
      pages: 0,
      importTotal: 0,
      importedCount: 0,
      searchQuery: '',
      searchTimeout: null,
      enableSaveVisitHistory: true
    };
  },

  beforeMount() {
    let vm = this;

    this.loading = true;
    this.illustHistory = new IllustHistory();

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
    caseDate(time) {
      let date = new Date(time * 1000);

      return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('/');
    },

    caseWorkUrl(id) {
      return `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${id}`;
    },

    caseWorkType(type) {
      if (type == 1) {
        return "Manga";
      } else if (type == 2) {
        return "Ugoira";
      } else if (type == 0) {
        return "Illustration";
      } else {
        return "Unkown";
      }
    },

    openInNew(illust) {
      window.open('https://www.pixiv.net/member_illust.php?mode=medium&illust_id=' + illust.id)
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

      let vm = this

      this.illustHistory.deleteIllust(this.illustDeleteReady).then(() => {
        vm.illusts.splice(vm.illusts.indexOf(this.illustDeleteReady), 1)
        vm.total--
      })
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
        console.table(illusts);
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
    },

    exportIllustHistory() {
      if (this.exporting || this.importing) {
        return
      }

      this.exporting = true

      let json = ''
      let vm = this

      this.illustHistory.getIllusts({
        limit: null
      }).then(docs => {
        let blob = new Blob([JSON.stringify(docs)], {type: 'application/json'})

        let a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'illust_histories-' + Date.now() + '.json'
        document.body.appendChild(a);
        a.click()
        a.remove();
        vm.exporting = false
      })
    },

    importIllustHistory() {
      if (this.exporting || this.importing) {
        return
      }

      let input = document.createElement('input')
      let vm = this

      input.type = 'file'
      input.addEventListener('change', (e) => {
        const files = e.target.files

        let fileReader = new FileReader()

        vm.importing = true

        fileReader.addEventListener('load', () => {
          let items

          try {
            items = JSON.parse(fileReader.result)

            vm.importTotal = items.length

            let worker = new Worker('./import_illust_history_worker.js')

            worker.onmessage = e => {
              vm.importedCount = e.data.importedCount

              if (e.data.imported) {
                vm.importedCount = items.length

                vm.importTotal = 0 // disable displaying import progress

                vm.importing = false

                alert('Import complete, please reload the page.')
              }
            }

            worker.postMessage({
              items: items
            })

            // vm.importTotal = items.length

            // vm.importIllustItems(items).then(() => {
            //   alert('Import complete')
            //   window.location.reload()
            // })
          } catch (e) {
            console.log(e)
          }
        })

        fileReader.readAsText(files[0])
      })

      if (window.confirm('Import history data will take a long time, after import completed, it will take a long time to rebuild indexes (based on the data size). The existing data will not be overwritten. Are you sure? ')) {
        input.click()
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
}

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
  position: relative;
  margin-top: 20px;

  .scroller {
    width: 100%;
    height: 100%;
  }

  .illust-content {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    height: 90px;
    border-bottom: 1px solid #eee;
    background: #fff;
  }

  .illust-content__thumb-content {
    position: relative;
    width: 120px;
    height: 90px;
  }

  .illust-content__thumb {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .illust-content__info {
    flex: auto;
  }

  .illust-content__info-entity {
    font-size: 12px;
    padding: 5px 0 0 5px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .illust-content__info-entity--blod {
    font-weight: 700;
  }

  .illust-content__badge {
    position: relative;
    margin-right: 5px;
    padding: 3px;
    background: #ccc;
    font-weight: 300;
  }

  .illust-content__badge--type0 {
    color: #fff;
    background:brown;
  }

  .illust-content__badge--type1 {
    color: #fff;
    background:cadetblue;
  }

  .illust-content__badge--type2 {
    color: #fff;
    background:coral;
  }

  .illust-content__actions {
    width: 120px;
    text-align: right;
  }

  .illust-content__actions-btn {
    margin: 27px 10px;
    color: rgb(88, 88, 88);
  }
}
</style>
