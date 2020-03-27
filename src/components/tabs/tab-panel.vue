<template>
  <div
    v-if="loaded || isActive"
    v-show="isActive"
    style="width: 100%; height: 100%;"
  >
    <slot />
  </div>
</template>

<script>
  export default {
    props: {
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
