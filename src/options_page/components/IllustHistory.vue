<template>
  <div class="container container--big">
    <!-- <page-title title="Illust History"></page-title> -->
    <!-- Searchbar -->
    <v-text-field
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
      <v-flex v-else lg1 md2 sm3 xs4 v-for="(illust, i) in illusts" :key="i">
        <v-card class="card--history-item">
          <div class="card--image-wrap">
            <div v-if="illust.r && !disableBlurOnR" class="card--image__mask"></div>
            <div class="card--image" :style="{paddingBottom: '117%', backgroundImage: 'url(' + illust.images.thumb + ')'}"></div>
          </div>
          <div class="card--history-info">{{ illust.title }}</div>
          <div class="card--type">{{ readableType(illust.type) }}</div>
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
        style="margin-left:0">Newer</v-btn>
      <v-btn
        depressed
        color="#eee"
        @click="next()">Older</v-btn>
      <v-menu open-on-hover top offset-y>
        <template v-slot:activator="{ on }">
          <v-btn
            depressed
            color="#eee"
            v-on="on">
            Page {{ page }}
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
import PageTitle from '@@/components/PageTitle'
import IllustHistory from '@/repositories/IllustHistory'

export default {
  components: {
    'page-title': PageTitle
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
      illustHistory: new IllustHistory(),
      exporting: false,
      importing: false,
      pages: 0,
      importTotal: 0,
      importedCount: 0,
      searchQuery: '',
      searchTimeout: null
    };
  },

  beforeMount() {
    let vm = this;

    this.loading = true

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
    isPlus() {
      return this.$root.plusVersion
    },

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
    readableType(type) {
      if (type == 1) {
        return "M";
      } else if (type == 2) {
        return "A";
      } else if (type == 0) {
        return "I";
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
        a.click()
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
  }

  &:hover .card--image__mask {
    opacity: 0;
  }
}
</style>
