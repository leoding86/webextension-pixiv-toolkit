<template>
  <a class="button"
    :class="buttonColor"
    :href="href"
    :download="download"
    :title="title"
    @click="$emit('click')"><slot>{{ text }}</slot></a>
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
    }
  },

  computed: {
    buttonColor() {
      if (this.type) {
        return `button--${this.type}`;
      } else {
        return null;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .button {
    display:inline-block;
    margin-right: 5px;
    padding: 3px 13px;
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
</style>
