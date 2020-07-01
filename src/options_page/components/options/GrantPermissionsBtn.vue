<template>
  <v-btn
    depressed
    @click="buttonClickHandle"
  >{{ !granted ? 'Grant' : 'Remove' }}</v-btn>
</template>

<script>
export default {
  props: {
    itemKey: {
      required: true,
      type: String
    },

    permissions: {
      required: true,
      type: Object
    }
  },

  data() {
    return {
      granted: false
    };
  },

  mounted() {
    this.granted = !!this.browserItems[this.itemKey];
  },

  methods: {
    buttonClickHandle() {
      let permissionsOperation = this.granted ? 'remove' : 'request';

      browser.permissions[permissionsOperation](this.permissions, result => {
        if (result === true) {
          this.granted = permissionsOperation === 'request' ? true : false;

          let data = {};
          data[this.itemKey] = this.granted;

          browser.storage.local.set(data);
        }
      });
    }
  }
}
</script>
