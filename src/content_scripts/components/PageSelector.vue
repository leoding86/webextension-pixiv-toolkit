<template>
  <div class="ptk__page-selector">
    <ptk-dialog
      :show.sync="showSelectionDialog"
    >
      <template slot="head">
        {{ tl('_select_pages_you_want_to_download') }}
      </template>
      <div class="ptk__page-selector">
        <div class="ptk__page-preview"
          :class="{ 'ptk__page-preview--selected': page.selected }"
          :style="{
            'background-image': `url(${page.page})`
          }"
          v-for="(page, idx) in pages"
          :key="idx"
          @click="selectPage(idx)"
        >
          <div class="ptk__page-preview--download">
            <svg viewBox="0 0 120 120">
              <polyline points="60,105 60,8"></polyline>
              <polyline points="10,57 60,8 110,57"></polyline>
            </svg>
          </div>
        </div>
      </div>
      <template slot="foot">
        <ptk-button @click="selectAll">{{ tl('_select_all') }}</ptk-button>
        <ptk-button @click="unselectAll">{{ tl('_unselect_all') }}</ptk-button>
        <ptk-button @click="selectInvert">{{ tl('_select_invert') }}</ptk-button>
        <ptk-button @click="downloadSelectedPages" :disabled="selectedPageIndexes.length < 1">{{ tl('_download') }}</ptk-button>
        <ptk-button @click="closeSelectionDialog">{{ tl('_close') }}</ptk-button>
      </template>
    </ptk-dialog>
    <ptk-button
      :text="tl('_select_and_dl')"
      @click="openSelectionDialog()"
    ></ptk-button>
  </div>
</template>

<script>
import Button from '@/content_scripts/components/Button';
import Dialog from '@/content_scripts/components/Dialog';

export default {
  name: 'page-selector',

  components: {
    'ptk-button': Button,
    'ptk-dialog': Dialog,
  },

  props: {
    items: {
      required: true,
      type: Array,
      default: [],
    }
  },

  data() {
    return {
      show: false,
      showSelectionDialog: false,
      pages: [],
      selectedPageIndexes: [],
    }
  },

  watch: {
    items(val) {
      if (val) {
        this.pages = val.map(item => {
          return {
            page: item,
            selected: false
          }
        });
      }
    }
  },

  created() {
    this.pages = this.items.map(item => {
      return {
        page: item,
        selected: false,
      };
    });
  },

  mounted() {

  },

  beforeDestroy() {
    //
  },

  methods: {
    openSelectionDialog() {
      this.showSelectionDialog = true;
    },

    emitSelect() {
      this.$emit('select', this.pages.filter(page => page.selected), this.selectedPageIndexes);
    },

    selectPage(idx) {
      let page = this.pages[idx];

      if (page.selected) {
        page.selected = false;

        let index = this.selectedPageIndexes.indexOf(idx);

        if (index > -1) {
          this.selectedPageIndexes.splice(index, 1);
        }
      } else {
        page.selected = true;

        if (this.selectedPageIndexes.indexOf(idx) < 0) {
          this.selectedPageIndexes.push(parseInt(idx));
        }
      }

      this.$set(this.pages, idx, page);

      this.emitSelect();
    },

    selectAll() {
      for (let idx in this.pages) {
        this.$set(this.pages, idx, Object.assign(this.pages[idx], { selected: true }));
        this.selectedPageIndexes.push(parseInt(idx));
      }

      this.emitSelect();
    },

    unselectAll() {
      for (let idx in this.pages) {
        this.$set(this.pages, idx, Object.assign(this.pages[idx], { selected: false }));
        this.selectedPageIndexes = [];
      }

      this.emitSelect();
    },

    selectInvert() {
      /**
       * Clear selections
       */
      this.selectedPageIndexes = [];

      for (let idx in this.pages) {
        let selectedValue = this.pages[idx].hasOwnProperty('selected') ?
          !this.pages[idx].selected : true;
        this.$set(this.pages, idx, Object.assign(this.pages[idx], { selected: selectedValue }));

        if (selectedValue) {
          this.selectedPageIndexes.push(parseInt(idx));
        }
      }

      this.emitSelect();
    },

    closeSelectionDialog() {
      this.showSelectionDialog = false;
    },

    downloadSelectedPages() {
      this.$emit('download', {
        selectedPageIndexes: this.selectedPageIndexes
      });
    },

    updatePage(index, url) {
      this.$set(this.pages, index, Object({ page: url }, this.pages[index]));
    }
  }
}
</script>

<style lang="scss">
.ptk__page-selector {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;

  svg {
    width: 24px;
    height: 24px;
    stroke: #fff;
    fill: none;
    stroke-width: 10;
    stroke-linecap: round;
    stroke-linejoin: round;
    transform: rotate(180deg);
  }
}
.ptk__page-preview {
  width: 128px;
  height: 128px;
  border-radius: 10px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
  background-color: lightgray;
  margin: 0 5px 5px 0;
  cursor: pointer;

  img {
    display: block;
  }
}

.ptk__page-preview--selected {
  .ptk__page-preview--download {
    display: flex;
  }
}

.ptk__page-preview--download {
  display: none;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.33);
}
</style>
