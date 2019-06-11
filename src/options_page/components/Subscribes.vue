<template>
    <v-container style="max-width: 800px;">
      <v-card v-if="Object.keys(users).length >= 5">
        <p style="font-size: 14px;padding: 10px 20px;">Sorry, you reached the subscription limitation. Please consider support me on Patreon then you can get unlimited subscription feature. I'll develop more useful features for my patrons. Thanks!</p>
      </v-card>
      <v-list v-if="Object.keys(users).length > 0" style="background:none;margin-left:-5px;margin-right:-5px;"
        two-line>
        <div class="listitem--wrap"
          v-for="(user, i) in users"
          :key="i">
          <v-list-tile class="listitem--user"
            @click="openInNewTab(user)">
            <v-list-tile-avatar :size="50">
              <img :src="user.head">
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ user.name }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ user.name }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn ripple icon @click.stop @click="deleteClickedHandle(user)">
                <v-icon>delete</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </div>
      </v-list>
    </v-container>
</template>

<script>
import PlusAddon from '@/modules/PlusAddon'

let plusAddon = new PlusAddon()
plusAddon.checkBeforeSend = true

export default {
  data() {
    return {
      users: {}
    }
  },

  mounted() {
    let vm = this

    // check plus addon

    plusAddon.getSubscribedUsers().then(response => {
      vm.users = response
    })
  },

  methods: {
    openInNewTab(user) {
      window.open('https://www.pixiv.net/member.php?id=' + user.id, '_blank')
    },

    deleteClickedHandle(user) {
      let vm = this

      if (!window.confirm('Are you sure?')) {
        return
      }

      plusAddon.unsubscribeUser({
        userId: user.id
      }).then(() => {
        vm.users.splice(vm.users.indexOf(user), 1)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.listitem--wrap {
  display: inline-block;
  width: 33.3333333%;
}

.listitem--user {
  padding: 5px;
}

@media (max-width: 640px) {
  .listitem--wrap {
    width: 50%;
  }
}
</style>

<style lang="scss">
.listitem--user .v-list__tile {
  background: #fff;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3)
  }
}
</style>
