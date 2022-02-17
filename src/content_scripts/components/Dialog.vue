<template>
  <div class="ptk__dialog"
    :class="{ 'ptk__dialog--show': show }"
    @click="handleDialogMaskClick"
  >
    <div class="ptk__dialog-container"
      @click="hanldeDialogContainerClick"
    >
      <div class="ptk__dialog-wrapper">
        <div class="ptk__dialog-head" v-if="hasHead">
          <slot name="head"></slot>
        </div>
        <div class="ptk__dialog-body">
          <slot></slot>
        </div>
        <div class="ptk__dialog-foot" v-if="hasFoot">
          <slot name="foot"></slot>
        </div>
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
    },
    closeOnMaskClick: {
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

  computed: {
    hasHead() {
      return Array.isArray(this.$slots.head) && this.$slots.head.length > 0;
    },

    hasFoot() {
      return Array.isArray(this.$slots.foot) && this.$slots.foot.length > 0;
    }
  },

  methods: {
    hanldeDialogContainerClick(event) {
      event.stopPropagation();
      return;
    },

    handleDialogMaskClick() {
      if (this.closeOnMaskClick) {
        this.$emit('update:show', false);
      }
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
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.333);

  .ptk__dialog-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 50%;
    margin: 0 auto;
  }

  .ptk__dialog-wrapper {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
  }

  .ptk__dialog-head {
    padding: 20px 0 10px 0;
    background: #fff;
    text-align: center;
  }

  .ptk__dialog-body {
    padding: 10px;
    background: #fff;
    overflow-y: auto;
  }

  .ptk__dialog-foot {
    display: flex;
    justify-content: center;
    padding: 10px 0 20px 0;
    background: #fff;
  }
}

.ptk__dialog--show {
  display: flex;
}
</style>
