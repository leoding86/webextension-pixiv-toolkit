<template>
  <div class="subscription-button"
    style="right:180px;"
    @click="clickHandler">{{ subscribeText }}</div>
</template>

<script>
export default {
  props: {
    userId: Number
  },

  data() {
    return {
      ready: false,
      subscribing: false,
      subscribed: false
    }
  },

  computed: {
    subscribeText() {
      if (!this.ready) {
        return 'Checking'
      }

      if (this.subscribing === true) {
        return 'Processing'
      }

      return this.subscribed ? 'Unsubscribe' : 'Subscribe'
    }
  },

  beforeMount() {
    plusAddonPort.port.onMessage.addListener(this.plusAddonPortListener)

    // Check if user has been subscribed
    plusAddonPort.hasUserSubscribed({
      userId: this.userId
    })
  },

  beforeDestroy() {
    plusAddonPort.port.onMessage.removeListener(this.plusAddonPortListener)
  },

  methods: {
    clickHandler() {
      //
    },

    plusAddonPortListener(message, port) {
      //
    }
  }
}
</script>

<style lang="scss" scoped>
.subscription-button {
  background: #d63377 !important;
}
</style>
