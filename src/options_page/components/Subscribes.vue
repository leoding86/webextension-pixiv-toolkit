<template>
    <v-container style="max-width: 800px;">
      <v-card v-if="users.length >= 5">
        <p style="font-size: 14px;padding: 10px 20px;">Sorry, you reached the subscription limitation. Please consider support me on Patreon then you can get unlimited subscription feature. I'll develop more useful features for my patrons. Thanks!</p>
      </v-card>
      <v-list v-if="users.length > 0" style="background:none;margin-left:-5px;margin-right:-5px;"
        two-line>
        <div class="listitem--wrap"
          v-for="(user, i) in users"
          :key="i">
          <v-list-tile class="listitem--user"
            ripple
            @click="alert(user)">
            <v-list-tile-avatar :size="50">
              <img :src="user.avatar">
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ user.userName }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ user.userName }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </div>
      </v-list>
    </v-container>
</template>

<script>
export default {
  data() {
    return {
      users: [{
        avatar: 'http://placehold.it/300x300',
        userName: 'username'
      }, {
        avatar: 'http://placehold.it/300x300',
        userName: 'username'
      }, {
        avatar: 'http://placehold.it/300x300',
        userName: 'username'
      }, {
        avatar: 'http://placehold.it/300x300',
        userName: 'username'
      }, {
        avatar: 'http://placehold.it/300x300',
        userName: 'username'
      }]
    }
  },

  methods: {
    alert(user) {
      window.alert(user)
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
