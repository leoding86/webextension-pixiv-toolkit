<template>
  <div v-if="show" style="padding: 6px 0 0 20px;text-align:center;">
    <ptk-button :href="fileUrl" :download="filename" :text="'Download'"></ptk-button>
  </div>
</template>

<script>
import Button from '@/content_scripts/components/Button';

export default {
  components: {
    'ptk-button': Button
  },

  props: {
    tool: Object,
  },

  data() {
    return {
      novelTool: null,
      show: false,
      fileUrl: null,
      filename: null
    }
  },

  mounted() {
    let vm = this;

    this.novelTool = this.tool;

    this.novelTool.init().then(blob => {
      vm.show = true;
      vm.fileUrl = blob;
      vm.filename = vm.novelTool.filename;
    });
  }
}
</script>
