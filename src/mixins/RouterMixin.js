import { promised } from "q";

export default {
  methods: {
    pushRoute(args) {
      return this.$router.push(args).then(() => {
        return Promise.resolve();
      }).catch(error => {
        if (error.name === 'NavigationDuplicated') {
          // ignore
          return;
        }

        return Promise.reject(error);
      });
    }
  }
}
