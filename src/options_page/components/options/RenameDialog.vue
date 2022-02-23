<template>
  <v-dialog v-model="showDialog" max-width="560">
    <v-card>
      <v-card-text>
        <h2>{{ tl("Rename_illustration") }}</h2>
        <div class="section-block">
          <h3>{{ tl("quick_picks") }}</h3>
          <v-btn
            small
            v-for="meta in metas"
            :key="meta.value"
            :ripple="false"
            color="info"
            @click="pickMeta(meta)"
            >{{ meta.title }}</v-btn
          >
        </div>
        <div class="section-block">
          <h3>{{ tl("rename_format") }}</h3>
          <v-text-field
            class="v-input-first"
            ref="renameInput"
            v-model="renameFormat"
            placeholder="Not set"
            :hint="
              tl(
                '_example_authorId_id_if_you_use_start_page_num_or_last_page_num_you_should_place_the_page_section_between_the_two_hash_tags_like_id_startPageNum_lastPageNum'
              )
            "
            :persistent-hint="true"
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
import renameFormatMixin from "@@/mixins/renameFormatMixin";

export default {
  name: "rename-dialog",

  mixins: [renameFormatMixin],

  props: {
    value: {
      required: false,
      type: String,
      default: '',
    },

    title: {
      required: true,
      type: String,
      default: 'Rename',
    },

    metas: {
      required: true,
      type: Array, // [{holder: string, title: string}]
      default: [],
    },

    hint: {
      required: false,
      type: String,
      default: null,
    },

    show: {
      required: false,
      type: Boolean,
      default: false,
    }
  },

  data() {
    return {
      showDialog: false,
      saveTimeout: null,
    };
  },

  watch: {
    show(val) {
      this.showDialog = val;
    },

    showDialog(val) {
      this.$emit('update:show', val);
    },

    renameFormat: function (val) {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      this.saveTimeout = setTimeout(() => {
        this.$emit("input", val);
      }, 300);
    },
  },

  mounted() {
    this.renameFormat = this.value;
  },

  methods: {
    pickMeta: function (meta) {
      this.updateFormat(meta.holder);
      this.setInputCursor(this.$refs.renameInput.$refs.input, meta.holder);
    },
  },
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
