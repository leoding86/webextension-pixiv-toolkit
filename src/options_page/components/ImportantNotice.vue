<template>
  <v-dialog
    v-model="show"
    width="50%"
  >
    <v-card>
      <v-card-title class="headline grey lighten-2" primary-title>Important Notice</v-card-title>

      <v-card-text style="font-size:14px;">
        <v-list two-line>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>{{ tl('_grant_the_extension_to_access') }} <strong>techorus-cdn.com</strong></v-list-tile-title>
              <v-list-tile-sub-title>{{ tl('_some_user_find_some_resources_of_pixiv_are_store_at') }} <strong>techorus-cdn.com</strong><br>{{ tl('_you_can_grant_remove_permission_in_options_page_too') }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <grant-permissions-btn
                :item-key="accessTechorusCdnKey"
                :permissions="accessTechorusCdnPermissions"
              ></grant-permissions-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat @click="show = false">{{ tl('_close') }}</v-btn>
        <v-btn color="primary" flat @click="closeNotice">{{ tl('_do_not_show_again') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import SuperMixin from "@/mixins/SuperMixin";
import GrantPermissionsBtn from "@@/components/options/GrantPermissionsBtn";

export default {
  mixins: [
    SuperMixin
  ],

  components: {
    'grant-permissions-btn': GrantPermissionsBtn
  },

  data() {
    return {
      show: false,

      accessTechorusCdnKey: 'accessTechorusCdn',
      accessTechorusCdnPermissions: { origins: ["*://*.techorus-cdn.com/*"] }
    };
  },

  mounted() {
    if (!this.browserItems.importantNoticeDisplayed) {
      this.show = true;
    }
  },

  methods: {
    closeNotice() {
      browser.storage.local.set({ importantNoticeDisplayed: true });

      this.show = false;
    }
  }
};
</script>
