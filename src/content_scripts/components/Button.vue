<template>
  <a class="button"
    :class="classnames"
    :href="href"
    :download="download"
    :title="title"
    @click="handleClick"><slot>{{ text }}</slot></a>
</template>

<script>
export default {
  props: {
    text: [String, Number],
    href: String,
    download: String,
    title: String,
    type: {
      required: false,
      type: String
    },
    disabled: {
      required: false,
      type: Boolean,
      default: false
    }
  },

  computed: {
    classnames() {
      let classnames = [];

      if (this.type) {
        classnames.push(`button--${this.type}`);
      }

      if (this.disabled) {
        classnames.push(`button--disabled`);
      }

      return classnames.join(' ');
    }
  },

  methods: {
    handleClick() {
      if (!this.disabled) {
        this.$emit('click');
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .button {
    display:inline-block;
    margin: 0 2.5px;
    padding: 6px 22px;
    border-radius: 50px;
    font-size: 12px;
    background: rgb(0, 150, 250);
    border:rgb(0, 150, 250) solid 3px;
    color: #fff;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
  }

  .button--success {
    border-color:#00dc68;
  }

  .button--disabled {
    opacity: 0.3;
  }
</style>
