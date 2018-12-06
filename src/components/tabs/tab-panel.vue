<template>
  <div
    v-if="loaded || isActive"
    v-show="isActive"
  >
    <slot/>
  </div>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        default: '',
      },
      value: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        loaded: false,
      };
    },
    computed: {
      isActive() {
        const active = this.$parent.activeTab === this.value;

        if (active) {
          this.loaded = true; // eslint-disable-line vue/no-side-effects-in-computed-properties
        }

        return active;
      },
    },
  };
</script>

<style scoped>
</style>
