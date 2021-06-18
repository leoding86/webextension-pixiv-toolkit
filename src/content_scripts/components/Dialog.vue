<template>
  <div class="ptk__dialog"
    :class="{ 'ptk__dialog--show': show }"
    @click="$emit('update:show', false)"
  >
    <div class="ptk__dialog-container"
      @click="hanldeDialogContainerClick"
    >
      <div class="ptk__dialog-head">
        <slot name="head"></slot>
      </div>
      <div class="ptk__dialog-body">
        <slot></slot>
      </div>
      <div class="ptk__dialog-foot">
        <slot name="foot"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      required: true,
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      showDialog: false
    }
  },

  created() {
    this.showDialog = this.show;
  },

  methods: {
    hanldeDialogContainerClick(event) {
      event.stopPropagation();
      return;
    }
  }
}
</script>

<style lang="scss">
.ptk__dialog {
  display: none;
  width: 100%;
  height: 100%;
  overflow: visible;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.333);

  .ptk__dialog-container {
    width: 50%;
    height: 100%;
    margin: 0 auto;
    overflow-y: auto;
    background: #fff;
  }

  .ptk__dialog-head {
    //
  }

  .ptk__dialog-body {
    //
  }

  .pth__dialog-foot {
    //
  }
}

.ptk__dialog--show {
  display: block;
}
</style>
