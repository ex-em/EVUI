export default {
  methods: {
    dispatch(componentName, eventName, params) {
      let parent = this.$parent || this.$root;
      let name = parent.$options.name;

      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.name;
        }
      }
      if (parent) {
        // eslint-disable-next-line prefer-spread
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
  },
};
