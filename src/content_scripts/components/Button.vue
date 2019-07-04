<template>
  <a class="button" :href="href" :download="download"
    @click="$emit('click')">{{ text }}</a>
</template>

<script>
export default {
  props: {
    text: [String, Number],
    href: String,
    download: String
  }
}
</script>

<style lang="scss" scoped>
  .button {
    display:inline-block;
    margin-right: 10px;
    padding: 5px 20px;
    border-radius: 50px;
    font-size: 14px;
    background: rgb(0, 150, 250);
    color: #fff;
    font-weight: 700;
    cursor: pointer;
  }
</style>
