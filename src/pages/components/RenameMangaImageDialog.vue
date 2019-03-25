<template>
  <v-dialog v-model="showDialog" max-width="560">
    <v-card>
      <v-card-text>
        <h2>{{ lt('rename_manga_image') }}</h2>
        <div class="section-block">
          <h3>{{ lt('quick_picks') }}</h3>
          <v-btn
            small
            v-for="meta in metasConfig"
            :key="meta.value"
            :ripple="false"
            color="info"
            @click="pickMeta(meta)"
          >{{ meta.title }}</v-btn>
        </div>
        <div class="section-block">
          <h3>{{ lt('rename_format') }}</h3>
          <v-text-field
            class="v-input-first"
            ref="renameInput"
            v-model="renameFormat"
            placeholder="Not set"
            hint="Example: {authorId}_{id}_{pageNum}"
            :persistent-hint=true
            @focus="updateInputPos"
            @keyup="updateInputPos"
            @click="updateInputPos"
          ></v-text-field>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import cr from "@/modules/cr";
import renameFormatMixin from '@/mixins/renameFormatMixin';

export default {
  name: "RenameMangaImageDialog",

  mixins: [renameFormatMixin],

  data() {
    return {
      showDialog: true,
      metasConfig: [
        {
          title: cr._e("id"),
          holder: "{id}"
        },
        {
          title: cr._e("author_id"),
          holder: "{authorId}"
        }, {
            title: cr._e("page_num"),
            holder: "{pageNum}"
        }
      ]
    };
  },

  watch: {
    showDialog: function(val) {
      if (!!val === false) {
        this.$router.go(-1);
      }
    },

    renameFormat: function(val) {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        this.saveTimeout = setTimeout(() => {
            cr._s.set({
                mangaImageRenameFormat: val
            }).then(() => {
                // console.log('Manga Image rename format saved');
            });
        }, 300);
    }
  },

  mounted() {
    if (!!this.$route.params.renameFormat) {
      this.renameFormat = this.$route.params.renameFormat;
    }
  },

  methods: {
    pickMeta: function(meta) {
      this.updateFormat(meta.holder);
      this.setInputCursor(this.$refs.renameInput.$refs.input, meta.holder);
    },

    lt(string) {
      return cr._e(string);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button {
  margin-left: 0;
  margin-right: 16px;
}
h3 {
  font-size: 1.2em;
  padding: 10px 0;
}
v-input {
  margin-top: 0;
}
</style>
